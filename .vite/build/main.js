"use strict";
const require$$3$1 = require("electron");
const path$1 = require("node:path");
const require$$0$1 = require("path");
const require$$1$1 = require("child_process");
const require$$0 = require("tty");
const require$$1 = require("util");
const require$$3 = require("fs");
const require$$4 = require("net");
const fs = require("node:fs/promises");
const node_child_process = require("node:child_process");
const node_util = require("node:util");
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var src = { exports: {} };
var browser = { exports: {} };
var debug$1 = { exports: {} };
var ms;
var hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms;
  hasRequiredMs = 1;
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var y = d * 365.25;
  ms = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isNaN(val) === false) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    if (ms2 >= d) {
      return Math.round(ms2 / d) + "d";
    }
    if (ms2 >= h) {
      return Math.round(ms2 / h) + "h";
    }
    if (ms2 >= m) {
      return Math.round(ms2 / m) + "m";
    }
    if (ms2 >= s) {
      return Math.round(ms2 / s) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    return plural(ms2, d, "day") || plural(ms2, h, "hour") || plural(ms2, m, "minute") || plural(ms2, s, "second") || ms2 + " ms";
  }
  function plural(ms2, n, name) {
    if (ms2 < n) {
      return;
    }
    if (ms2 < n * 1.5) {
      return Math.floor(ms2 / n) + " " + name;
    }
    return Math.ceil(ms2 / n) + " " + name + "s";
  }
  return ms;
}
var hasRequiredDebug;
function requireDebug() {
  if (hasRequiredDebug) return debug$1.exports;
  hasRequiredDebug = 1;
  (function(module, exports$1) {
    exports$1 = module.exports = createDebug.debug = createDebug["default"] = createDebug;
    exports$1.coerce = coerce;
    exports$1.disable = disable;
    exports$1.enable = enable;
    exports$1.enabled = enabled;
    exports$1.humanize = requireMs();
    exports$1.names = [];
    exports$1.skips = [];
    exports$1.formatters = {};
    var prevTime;
    function selectColor(namespace) {
      var hash = 0, i;
      for (i in namespace) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return exports$1.colors[Math.abs(hash) % exports$1.colors.length];
    }
    function createDebug(namespace) {
      function debug2() {
        if (!debug2.enabled) return;
        var self = debug2;
        var curr = +/* @__PURE__ */ new Date();
        var ms2 = curr - (prevTime || curr);
        self.diff = ms2;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        args[0] = exports$1.coerce(args[0]);
        if ("string" !== typeof args[0]) {
          args.unshift("%O");
        }
        var index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
          if (match === "%%") return match;
          index++;
          var formatter = exports$1.formatters[format];
          if ("function" === typeof formatter) {
            var val = args[index];
            match = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        exports$1.formatArgs.call(self, args);
        var logFn = debug2.log || exports$1.log || console.log.bind(console);
        logFn.apply(self, args);
      }
      debug2.namespace = namespace;
      debug2.enabled = exports$1.enabled(namespace);
      debug2.useColors = exports$1.useColors();
      debug2.color = selectColor(namespace);
      if ("function" === typeof exports$1.init) {
        exports$1.init(debug2);
      }
      return debug2;
    }
    function enable(namespaces) {
      exports$1.save(namespaces);
      exports$1.names = [];
      exports$1.skips = [];
      var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      var len = split.length;
      for (var i = 0; i < len; i++) {
        if (!split[i]) continue;
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          exports$1.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
        } else {
          exports$1.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      exports$1.enable("");
    }
    function enabled(name) {
      var i, len;
      for (i = 0, len = exports$1.skips.length; i < len; i++) {
        if (exports$1.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports$1.names.length; i < len; i++) {
        if (exports$1.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) return val.stack || val.message;
      return val;
    }
  })(debug$1, debug$1.exports);
  return debug$1.exports;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser.exports;
  hasRequiredBrowser = 1;
  (function(module, exports$1) {
    exports$1 = module.exports = requireDebug();
    exports$1.log = log;
    exports$1.formatArgs = formatArgs;
    exports$1.save = save;
    exports$1.load = load;
    exports$1.useColors = useColors;
    exports$1.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : localstorage();
    exports$1.colors = [
      "lightseagreen",
      "forestgreen",
      "goldenrod",
      "dodgerblue",
      "darkorchid",
      "crimson"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
        return true;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    exports$1.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return "[UnexpectedJSONParseError]: " + err.message;
      }
    };
    function formatArgs(args) {
      var useColors2 = this.useColors;
      args[0] = (useColors2 ? "%c" : "") + this.namespace + (useColors2 ? " %c" : " ") + args[0] + (useColors2 ? "%c " : " ") + "+" + exports$1.humanize(this.diff);
      if (!useColors2) return;
      var c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if ("%%" === match) return;
        index++;
        if ("%c" === match) {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    function log() {
      return "object" === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }
    function save(namespaces) {
      try {
        if (null == namespaces) {
          exports$1.storage.removeItem("debug");
        } else {
          exports$1.storage.debug = namespaces;
        }
      } catch (e) {
      }
    }
    function load() {
      var r;
      try {
        r = exports$1.storage.debug;
      } catch (e) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    exports$1.enable(load());
    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {
      }
    }
  })(browser, browser.exports);
  return browser.exports;
}
var node = { exports: {} };
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node.exports;
  hasRequiredNode = 1;
  (function(module, exports$1) {
    var tty = require$$0;
    var util = require$$1;
    exports$1 = module.exports = requireDebug();
    exports$1.init = init;
    exports$1.log = log;
    exports$1.formatArgs = formatArgs;
    exports$1.save = save;
    exports$1.load = load;
    exports$1.useColors = useColors;
    exports$1.colors = [6, 2, 3, 4, 5, 1];
    exports$1.inspectOpts = Object.keys(process.env).filter(function(key) {
      return /^debug_/i.test(key);
    }).reduce(function(obj, key) {
      var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function(_, k) {
        return k.toUpperCase();
      });
      var val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
      else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
      else if (val === "null") val = null;
      else val = Number(val);
      obj[prop] = val;
      return obj;
    }, {});
    var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
    if (1 !== fd && 2 !== fd) {
      util.deprecate(function() {
      }, "except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)")();
    }
    var stream = 1 === fd ? process.stdout : 2 === fd ? process.stderr : createWritableStdioStream(fd);
    function useColors() {
      return "colors" in exports$1.inspectOpts ? Boolean(exports$1.inspectOpts.colors) : tty.isatty(fd);
    }
    exports$1.formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map(function(str) {
        return str.trim();
      }).join(" ");
    };
    exports$1.formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
    function formatArgs(args) {
      var name = this.namespace;
      var useColors2 = this.useColors;
      if (useColors2) {
        var c = this.color;
        var prefix = "  \x1B[3" + c + ";1m" + name + " \x1B[0m";
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push("\x1B[3" + c + "m+" + exports$1.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = (/* @__PURE__ */ new Date()).toUTCString() + " " + name + " " + args[0];
      }
    }
    function log() {
      return stream.write(util.format.apply(util, arguments) + "\n");
    }
    function save(namespaces) {
      if (null == namespaces) {
        delete process.env.DEBUG;
      } else {
        process.env.DEBUG = namespaces;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function createWritableStdioStream(fd2) {
      var stream2;
      var tty_wrap = process.binding("tty_wrap");
      switch (tty_wrap.guessHandleType(fd2)) {
        case "TTY":
          stream2 = new tty.WriteStream(fd2);
          stream2._type = "tty";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        case "FILE":
          var fs2 = require$$3;
          stream2 = new fs2.SyncWriteStream(fd2, { autoClose: false });
          stream2._type = "fs";
          break;
        case "PIPE":
        case "TCP":
          var net = require$$4;
          stream2 = new net.Socket({
            fd: fd2,
            readable: false,
            writable: true
          });
          stream2.readable = false;
          stream2.read = null;
          stream2._type = "pipe";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        default:
          throw new Error("Implement me. Unknown stream file type!");
      }
      stream2.fd = fd2;
      stream2._isStdio = true;
      return stream2;
    }
    function init(debug2) {
      debug2.inspectOpts = {};
      var keys = Object.keys(exports$1.inspectOpts);
      for (var i = 0; i < keys.length; i++) {
        debug2.inspectOpts[keys[i]] = exports$1.inspectOpts[keys[i]];
      }
    }
    exports$1.enable(load());
  })(node, node.exports);
  return node.exports;
}
if (typeof process !== "undefined" && process.type === "renderer") {
  src.exports = requireBrowser();
} else {
  src.exports = requireNode();
}
var srcExports = src.exports;
var path = require$$0$1;
var spawn = require$$1$1.spawn;
var debug = srcExports("electron-squirrel-startup");
var app = require$$3$1.app;
var run = function(args, done) {
  var updateExe = path.resolve(path.dirname(process.execPath), "..", "Update.exe");
  debug("Spawning `%s` with args `%s`", updateExe, args);
  spawn(updateExe, args, {
    detached: true
  }).on("close", done);
};
var check = function() {
  if (process.platform === "win32") {
    var cmd = process.argv[1];
    debug("processing squirrel command `%s`", cmd);
    var target = path.basename(process.execPath);
    if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
      run(["--createShortcut=" + target], app.quit);
      return true;
    }
    if (cmd === "--squirrel-uninstall") {
      run(["--removeShortcut=" + target], app.quit);
      return true;
    }
    if (cmd === "--squirrel-obsolete") {
      app.quit();
      return true;
    }
  }
  return false;
};
var electronSquirrelStartup = check();
const started = /* @__PURE__ */ getDefaultExportFromCjs(electronSquirrelStartup);
const IPC_CHANNELS = {
  // Filesystem
  FS_READ_FILE: "geminiOS:fs:readFile",
  FS_WRITE_FILE: "geminiOS:fs:writeFile",
  FS_READ_DIR: "geminiOS:fs:readDir",
  FS_STAT: "geminiOS:fs:stat",
  FS_MKDIR: "geminiOS:fs:mkdir",
  FS_DELETE: "geminiOS:fs:delete",
  // Shell
  SHELL_OPEN_EXTERNAL: "geminiOS:shell:openExternal",
  SHELL_EXEC: "geminiOS:shell:exec",
  // Clipboard
  CLIPBOARD_READ: "geminiOS:clipboard:read",
  CLIPBOARD_WRITE: "geminiOS:clipboard:write"
};
async function showPermissionDialog(parentWindow, request) {
  const result = await require$$3$1.dialog.showMessageBox(parentWindow, {
    type: request.risk === "critical" || request.risk === "high" ? "warning" : "question",
    title: `Permission: ${request.operation}`,
    message: request.operation,
    detail: request.description,
    buttons: ["Allow", "Deny"],
    defaultId: 1,
    cancelId: 1,
    noLink: true
  });
  return result.response === 0;
}
async function readFile(filePath, encoding) {
  const resolved = path$1.resolve(filePath);
  const content = await fs.readFile(resolved, { encoding: encoding || "utf-8" });
  return content;
}
async function writeFile(filePath, content) {
  const resolved = path$1.resolve(filePath);
  await fs.writeFile(resolved, content, "utf-8");
}
async function readDir(dirPath) {
  const resolved = path$1.resolve(dirPath);
  const entries = await fs.readdir(resolved, { withFileTypes: true });
  return entries.map((entry) => ({
    name: entry.name,
    isDirectory: entry.isDirectory(),
    isFile: entry.isFile()
  }));
}
async function stat(filePath) {
  const resolved = path$1.resolve(filePath);
  const stats = await fs.stat(resolved);
  return {
    size: stats.size,
    isFile: stats.isFile(),
    isDirectory: stats.isDirectory(),
    createdAt: stats.birthtime.toISOString(),
    modifiedAt: stats.mtime.toISOString()
  };
}
async function mkdir(dirPath, recursive) {
  const resolved = path$1.resolve(dirPath);
  await fs.mkdir(resolved, { recursive: recursive ?? false });
}
async function remove(targetPath, recursive) {
  const resolved = path$1.resolve(targetPath);
  await fs.rm(resolved, { recursive: recursive ?? false });
}
const execFileAsync = node_util.promisify(node_child_process.execFile);
async function openExternal(url) {
  await require$$3$1.shell.openExternal(url);
}
async function exec(command, args) {
  const { stdout, stderr } = await execFileAsync(command, args, {
    timeout: 3e4,
    maxBuffer: 1024 * 1024
  });
  return { stdout, stderr };
}
function readText() {
  return require$$3$1.clipboard.readText();
}
function writeText(text) {
  require$$3$1.clipboard.writeText(text);
}
function registerIpcHandlers(parentWindow) {
  require$$3$1.ipcMain.handle(IPC_CHANNELS.FS_READ_FILE, async (_event, filePath, encoding) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: "Read File",
      description: `The application wants to read the file:
${filePath}`,
      risk: "low"
    });
    if (!approved) throw new Error("Permission denied by user");
    return readFile(filePath, encoding);
  });
  require$$3$1.ipcMain.handle(IPC_CHANNELS.FS_WRITE_FILE, async (_event, filePath, content) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: "Write File",
      description: `The application wants to write to:
${filePath}

Content length: ${content.length} characters`,
      risk: "high"
    });
    if (!approved) throw new Error("Permission denied by user");
    return writeFile(filePath, content);
  });
  require$$3$1.ipcMain.handle(IPC_CHANNELS.FS_READ_DIR, async (_event, dirPath) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: "List Directory",
      description: `The application wants to list files in:
${dirPath}`,
      risk: "low"
    });
    if (!approved) throw new Error("Permission denied by user");
    return readDir(dirPath);
  });
  require$$3$1.ipcMain.handle(IPC_CHANNELS.FS_STAT, async (_event, filePath) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: "Get File Info",
      description: `The application wants to check file info:
${filePath}`,
      risk: "low"
    });
    if (!approved) throw new Error("Permission denied by user");
    return stat(filePath);
  });
  require$$3$1.ipcMain.handle(IPC_CHANNELS.FS_MKDIR, async (_event, dirPath, recursive) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: "Create Directory",
      description: `The application wants to create directory:
${dirPath}${recursive ? " (recursive)" : ""}`,
      risk: "medium"
    });
    if (!approved) throw new Error("Permission denied by user");
    return mkdir(dirPath, recursive);
  });
  require$$3$1.ipcMain.handle(IPC_CHANNELS.FS_DELETE, async (_event, targetPath, recursive) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: "Delete",
      description: `The application wants to DELETE:
${targetPath}${recursive ? "\n\n⚠ RECURSIVE — all contents will be removed" : ""}`,
      risk: "critical"
    });
    if (!approved) throw new Error("Permission denied by user");
    return remove(targetPath, recursive);
  });
  require$$3$1.ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, async (_event, url) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: "Open URL",
      description: `The application wants to open in your default browser:
${url}`,
      risk: "medium"
    });
    if (!approved) throw new Error("Permission denied by user");
    return openExternal(url);
  });
  require$$3$1.ipcMain.handle(IPC_CHANNELS.SHELL_EXEC, async (_event, command, args) => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: "Execute Command",
      description: `The application wants to run:
${command} ${args.join(" ")}`,
      risk: "critical"
    });
    if (!approved) throw new Error("Permission denied by user");
    return exec(command, args);
  });
  require$$3$1.ipcMain.handle(IPC_CHANNELS.CLIPBOARD_READ, async () => {
    const approved = await showPermissionDialog(parentWindow, {
      operation: "Read Clipboard",
      description: "The application wants to read your clipboard contents.",
      risk: "medium"
    });
    if (!approved) throw new Error("Permission denied by user");
    return readText();
  });
  require$$3$1.ipcMain.handle(IPC_CHANNELS.CLIPBOARD_WRITE, async (_event, text) => {
    const preview = text.length > 200 ? text.substring(0, 200) + "..." : text;
    const approved = await showPermissionDialog(parentWindow, {
      operation: "Write Clipboard",
      description: `The application wants to set your clipboard to:
"${preview}"`,
      risk: "low"
    });
    if (!approved) throw new Error("Permission denied by user");
    return writeText(text);
  });
}
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
  require$$3$1.app.quit();
}
let mainWindow = null;
const createWindow = () => {
  mainWindow = new require$$3$1.BaseWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: "GeminiOS"
  });
  const aiStudioView = new require$$3$1.WebContentsView({
    webPreferences: {
      preload: path$1.join(__dirname, "preload.js"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      partition: "persist:aistudio"
    }
  });
  mainWindow.contentView.addChildView(aiStudioView);
  const updateBounds = () => {
    if (!mainWindow) return;
    const { width, height } = mainWindow.getContentBounds();
    aiStudioView.setBounds({ x: 0, y: 0, width, height });
  };
  updateBounds();
  mainWindow.on("resize", updateBounds);
  aiStudioView.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://accounts.google.com") || url.startsWith("https://myaccount.google.com")) {
      require$$3$1.shell.openExternal(url);
      return { action: "deny" };
    }
    if (url.includes("google.com") || url.includes("googleapis.com")) {
      return { action: "allow" };
    }
    require$$3$1.shell.openExternal(url);
    return { action: "deny" };
  });
  aiStudioView.webContents.on("did-finish-load", () => {
    aiStudioView.webContents.executeJavaScript(PARENT_BRIDGE_CODE).catch(() => {
    });
  });
  aiStudioView.webContents.on(
    "did-frame-navigate",
    (_event, _url, _httpResponseCode, _httpStatusText, isMainFrame, frameProcessId, frameRoutingId) => {
      if (isMainFrame) return;
      try {
        const frame = require$$3$1.webFrameMain.fromId(frameProcessId, frameRoutingId);
        if (frame) {
          frame.executeJavaScript(IFRAME_SHIM_CODE).catch(() => {
          });
        }
      } catch (e) {
      }
    }
  );
  aiStudioView.webContents.on("frame-created", (_event, { frame }) => {
    if (!frame) return;
    frame.once("dom-ready", () => {
      if (frame && frame !== aiStudioView.webContents.mainFrame) {
        frame.executeJavaScript(IFRAME_SHIM_CODE).catch(() => {
        });
      }
    });
  });
  aiStudioView.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    const levelStr = ["verbose", "info", "warning", "error"][level] || "unknown";
    if (level >= 2) {
      console.log(`[WebContents ${levelStr}] ${message} (${sourceId}:${line})`);
    }
  });
  aiStudioView.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.log(`[WebContents did-fail-load] ${errorCode} ${errorDescription} URL: ${validatedURL}`);
  });
  aiStudioView.webContents.on("render-process-gone", (_event, details) => {
    console.log(`[WebContents render-process-gone]`, details);
  });
  aiStudioView.webContents.session.webRequest.onErrorOccurred(
    { urls: ["*://*/*"] },
    (details) => {
      console.log(`[Network Error] ${details.method} ${details.url} — ${details.error}`);
    }
  );
  aiStudioView.webContents.session.webRequest.onCompleted(
    { urls: ["*://*.googleapis.com/*", "*://*.google.com/*"] },
    (details) => {
      if (details.statusCode >= 400) {
        console.log(`[HTTP ${details.statusCode}] ${details.method} ${details.url}`);
      }
    }
  );
  const chromeVersion = process.versions.chrome;
  const standardUA = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
  aiStudioView.webContents.setUserAgent(standardUA);
  console.log(`[UserAgent] ${aiStudioView.webContents.getUserAgent()}`);
  aiStudioView.webContents.loadURL("https://aistudio.google.com/");
  registerIpcHandlers(mainWindow);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};
require$$3$1.app.whenReady().then(createWindow);
require$$3$1.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    require$$3$1.app.quit();
  }
});
require$$3$1.app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
