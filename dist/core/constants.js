"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PACKAGE_VERSION = exports.DEFAULT_MCP_PORT = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const FALLBACK_MCP_PORT = 28473;
function readMcpDefaultPort() {
    try {
        const pkgPath = path.join(__dirname, '../package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (typeof pkg.mcpDefaultPort === 'number' && pkg.mcpDefaultPort > 0) {
            return pkg.mcpDefaultPort;
        }
    }
    catch (_a) {
        // package.json unavailable during some tooling runs
    }
    return FALLBACK_MCP_PORT;
}
/** Default MCP HTTP port (from package.json "mcpDefaultPort"). */
exports.DEFAULT_MCP_PORT = readMcpDefaultPort();
function readPackageVersion() {
    try {
        const pkgPath = path.join(__dirname, '../package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (typeof pkg.version === 'string' && pkg.version.length > 0) {
            return pkg.version;
        }
    }
    catch (_a) {
        // package.json unavailable during some tooling runs
    }
    return '0.0.0';
}
/** Extension version (from package.json "version"). */
exports.PACKAGE_VERSION = readPackageVersion();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL2NvcmUvY29uc3RhbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFFN0IsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLENBQUM7QUFFaEMsU0FBUyxrQkFBa0I7SUFDdkIsSUFBSSxDQUFDO1FBQ0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUN4RCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFnQyxDQUFDO1FBQ3hGLElBQUksT0FBTyxHQUFHLENBQUMsY0FBYyxLQUFLLFFBQVEsSUFBSSxHQUFHLENBQUMsY0FBYyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ25FLE9BQU8sR0FBRyxDQUFDLGNBQWMsQ0FBQztRQUM5QixDQUFDO0lBQ0wsQ0FBQztJQUFDLFdBQU0sQ0FBQztRQUNMLG9EQUFvRDtJQUN4RCxDQUFDO0lBQ0QsT0FBTyxpQkFBaUIsQ0FBQztBQUM3QixDQUFDO0FBRUQsa0VBQWtFO0FBQ3JELFFBQUEsZ0JBQWdCLEdBQUcsa0JBQWtCLEVBQUUsQ0FBQztBQUVyRCxTQUFTLGtCQUFrQjtJQUN2QixJQUFJLENBQUM7UUFDRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQXlCLENBQUM7UUFDakYsSUFBSSxPQUFPLEdBQUcsQ0FBQyxPQUFPLEtBQUssUUFBUSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzVELE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQztRQUN2QixDQUFDO0lBQ0wsQ0FBQztJQUFDLFdBQU0sQ0FBQztRQUNMLG9EQUFvRDtJQUN4RCxDQUFDO0lBQ0QsT0FBTyxPQUFPLENBQUM7QUFDbkIsQ0FBQztBQUVELHVEQUF1RDtBQUMxQyxRQUFBLGVBQWUsR0FBRyxrQkFBa0IsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuY29uc3QgRkFMTEJBQ0tfTUNQX1BPUlQgPSAyODQ3MztcblxuZnVuY3Rpb24gcmVhZE1jcERlZmF1bHRQb3J0KCk6IG51bWJlciB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGtnUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9wYWNrYWdlLmpzb24nKTtcbiAgICAgICAgY29uc3QgcGtnID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGtnUGF0aCwgJ3V0ZjgnKSkgYXMgeyBtY3BEZWZhdWx0UG9ydD86IG51bWJlciB9O1xuICAgICAgICBpZiAodHlwZW9mIHBrZy5tY3BEZWZhdWx0UG9ydCA9PT0gJ251bWJlcicgJiYgcGtnLm1jcERlZmF1bHRQb3J0ID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHBrZy5tY3BEZWZhdWx0UG9ydDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBwYWNrYWdlLmpzb24gdW5hdmFpbGFibGUgZHVyaW5nIHNvbWUgdG9vbGluZyBydW5zXG4gICAgfVxuICAgIHJldHVybiBGQUxMQkFDS19NQ1BfUE9SVDtcbn1cblxuLyoqIERlZmF1bHQgTUNQIEhUVFAgcG9ydCAoZnJvbSBwYWNrYWdlLmpzb24gXCJtY3BEZWZhdWx0UG9ydFwiKS4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX01DUF9QT1JUID0gcmVhZE1jcERlZmF1bHRQb3J0KCk7XG5cbmZ1bmN0aW9uIHJlYWRQYWNrYWdlVmVyc2lvbigpOiBzdHJpbmcge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHBrZ1BhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcGFja2FnZS5qc29uJyk7XG4gICAgICAgIGNvbnN0IHBrZyA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBrZ1BhdGgsICd1dGY4JykpIGFzIHsgdmVyc2lvbj86IHN0cmluZyB9O1xuICAgICAgICBpZiAodHlwZW9mIHBrZy52ZXJzaW9uID09PSAnc3RyaW5nJyAmJiBwa2cudmVyc2lvbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gcGtnLnZlcnNpb247XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gcGFja2FnZS5qc29uIHVuYXZhaWxhYmxlIGR1cmluZyBzb21lIHRvb2xpbmcgcnVuc1xuICAgIH1cbiAgICByZXR1cm4gJzAuMC4wJztcbn1cblxuLyoqIEV4dGVuc2lvbiB2ZXJzaW9uIChmcm9tIHBhY2thZ2UuanNvbiBcInZlcnNpb25cIikuICovXG5leHBvcnQgY29uc3QgUEFDS0FHRV9WRVJTSU9OID0gcmVhZFBhY2thZ2VWZXJzaW9uKCk7XG4iXX0=