import { app, BaseWindow, WebContentsView, shell, webFrameMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { registerIpcHandlers } from './ipc-handlers';

// Code injected into the main frame's main world.
// Listens for a single handshake postMessage from child iframes, then
// switches to a private MessageChannel for all subsequent communication.
// This prevents AI Studio's own postMessage handlers from intercepting our traffic.
const PARENT_BRIDGE_CODE = `
  if (!window.__geminiOSBridgeInstalled) {
    window.__geminiOSBridgeInstalled = true;
    window.addEventListener('message', (event) => {
      if (!event.data || event.data.type !== '__geminiOS_handshake__') return;
      const port = event.ports[0];
      if (!port) return;
      port.onmessage = async (msg) => {
        const { id, method, args } = msg.data;
        try {
          const parts = method.split('.');
          let fn = window.geminiOS;
          for (const part of parts) {
            fn = fn[part];
          }
          const result = await fn.apply(null, args);
          port.postMessage({ id, result });
        } catch (err) {
          port.postMessage({ id, error: err.message });
        }
      };
    });
  }
`;

// Code injected into child frames (iframes).
// Creates a private MessageChannel, sends one port to the parent via a
// handshake postMessage, then uses the channel for all API communication.
const IFRAME_SHIM_CODE = `
  if (!window.geminiOS) {
    const __channel = new MessageChannel();
    const __port = __channel.port1;
    let __reqId = 0;
    const __pending = new Map();

    __port.onmessage = (event) => {
      const { id, result, error } = event.data;
      const p = __pending.get(id);
      if (!p) return;
      __pending.delete(id);
      if (error) p.reject(new Error(error));
      else p.resolve(result);
    };

    // Send port2 to parent — this is the ONLY postMessage we ever send.
    window.parent.postMessage({ type: '__geminiOS_handshake__' }, '*', [__channel.port2]);

    function __call(method, args) {
      return new Promise((resolve, reject) => {
        const id = ++__reqId;
        __pending.set(id, { resolve, reject });
        __port.postMessage({ id, method, args });
      });
    }

    window.geminiOS = {
      fs: {
        readFile: (path, encoding) => __call('fs.readFile', [path, encoding]),
        writeFile: (path, content) => __call('fs.writeFile', [path, content]),
        readDir: (dirPath) => __call('fs.readDir', [dirPath]),
        stat: (path) => __call('fs.stat', [path]),
        mkdir: (dirPath, recursive) => __call('fs.mkdir', [dirPath, recursive]),
        delete: (targetPath, recursive) => __call('fs.delete', [targetPath, recursive]),
      },
      shell: {
        openExternal: (url) => __call('shell.openExternal', [url]),
        exec: (command, args) => __call('shell.exec', [command, args]),
      },
      clipboard: {
        readText: () => __call('clipboard.readText', []),
        writeText: (text) => __call('clipboard.writeText', [text]),
      },
    };
  }
`;

if (started) {
  app.quit();
}

let mainWindow: BaseWindow | null = null;

const createWindow = (): void => {
  mainWindow = new BaseWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'GeminiOS',
  });

  const aiStudioView = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      partition: 'persist:aistudio',
    },
  });

  mainWindow.contentView.addChildView(aiStudioView);

  const updateBounds = () => {
    if (!mainWindow) return;
    const { width, height } = mainWindow.getContentBounds();
    aiStudioView.setBounds({ x: 0, y: 0, width, height });
  };
  updateBounds();
  mainWindow.on('resize', updateBounds);

  // Handle links that want to open in a new window (e.g. Google OAuth popups)
  aiStudioView.webContents.setWindowOpenHandler(({ url }) => {
    // Allow Google auth-related popups to open in the default browser
    if (url.startsWith('https://accounts.google.com') || url.startsWith('https://myaccount.google.com')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    // Allow other google domains to open within the app
    if (url.includes('google.com') || url.includes('googleapis.com')) {
      return { action: 'allow' };
    }
    // Open anything else in the default browser
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Inject the parent-side bridge into the main frame after it loads
  aiStudioView.webContents.on('did-finish-load', () => {
    aiStudioView.webContents.executeJavaScript(PARENT_BRIDGE_CODE).catch(() => {});
  });

  // Inject the shim into child frames (iframes) when they navigate
  aiStudioView.webContents.on('did-frame-navigate',
    (_event, _url, _httpResponseCode, _httpStatusText, isMainFrame, frameProcessId, frameRoutingId) => {
      if (isMainFrame) return;
      try {
        const frame = webFrameMain.fromId(frameProcessId, frameRoutingId);
        if (frame) {
          frame.executeJavaScript(IFRAME_SHIM_CODE).catch(() => {});
        }
      } catch (e) {
        // Frame may have been destroyed
      }
    }
  );

  // Also handle frames created dynamically (e.g. srcdoc iframes)
  aiStudioView.webContents.on('frame-created', (_event, { frame }) => {
    if (!frame) return;
    frame.once('dom-ready', () => {
      if (frame && frame !== aiStudioView.webContents.mainFrame) {
        frame.executeJavaScript(IFRAME_SHIM_CODE).catch(() => {});
      }
    });
  });

  // Diagnostic logging
  aiStudioView.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    const levelStr = ['verbose', 'info', 'warning', 'error'][level] || 'unknown';
    if (level >= 2) { // warnings and errors only
      console.log(`[WebContents ${levelStr}] ${message} (${sourceId}:${line})`);
    }
  });

  aiStudioView.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.log(`[WebContents did-fail-load] ${errorCode} ${errorDescription} URL: ${validatedURL}`);
  });

  aiStudioView.webContents.on('render-process-gone', (_event, details) => {
    console.log(`[WebContents render-process-gone]`, details);
  });

  aiStudioView.webContents.session.webRequest.onErrorOccurred(
    { urls: ['*://*/*'] },
    (details) => {
      console.log(`[Network Error] ${details.method} ${details.url} — ${details.error}`);
    }
  );

  aiStudioView.webContents.session.webRequest.onCompleted(
    { urls: ['*://*.googleapis.com/*', '*://*.google.com/*'] },
    (details) => {
      if (details.statusCode >= 400) {
        console.log(`[HTTP ${details.statusCode}] ${details.method} ${details.url}`);
      }
    }
  );

  // Override the user agent to a standard Chrome UA.
  // Google services block or degrade Electron-based user agents.
  const chromeVersion = process.versions.chrome;
  const standardUA = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
  aiStudioView.webContents.setUserAgent(standardUA);
  console.log(`[UserAgent] ${aiStudioView.webContents.getUserAgent()}`);

  aiStudioView.webContents.loadURL('https://aistudio.google.com/');

  registerIpcHandlers(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
