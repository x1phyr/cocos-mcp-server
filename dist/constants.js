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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc291cmNlL2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBRTdCLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxDQUFDO0FBRWhDLFNBQVMsa0JBQWtCO0lBQ3ZCLElBQUksQ0FBQztRQUNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDeEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBZ0MsQ0FBQztRQUN4RixJQUFJLE9BQU8sR0FBRyxDQUFDLGNBQWMsS0FBSyxRQUFRLElBQUksR0FBRyxDQUFDLGNBQWMsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNuRSxPQUFPLEdBQUcsQ0FBQyxjQUFjLENBQUM7UUFDOUIsQ0FBQztJQUNMLENBQUM7SUFBQyxXQUFNLENBQUM7UUFDTCxvREFBb0Q7SUFDeEQsQ0FBQztJQUNELE9BQU8saUJBQWlCLENBQUM7QUFDN0IsQ0FBQztBQUVELGtFQUFrRTtBQUNyRCxRQUFBLGdCQUFnQixHQUFHLGtCQUFrQixFQUFFLENBQUM7QUFFckQsU0FBUyxrQkFBa0I7SUFDdkIsSUFBSSxDQUFDO1FBQ0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUN4RCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUF5QixDQUFDO1FBQ2pGLElBQUksT0FBTyxHQUFHLENBQUMsT0FBTyxLQUFLLFFBQVEsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUM1RCxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUM7UUFDdkIsQ0FBQztJQUNMLENBQUM7SUFBQyxXQUFNLENBQUM7UUFDTCxvREFBb0Q7SUFDeEQsQ0FBQztJQUNELE9BQU8sT0FBTyxDQUFDO0FBQ25CLENBQUM7QUFFRCx1REFBdUQ7QUFDMUMsUUFBQSxlQUFlLEdBQUcsa0JBQWtCLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmNvbnN0IEZBTExCQUNLX01DUF9QT1JUID0gMjg0NzM7XG5cbmZ1bmN0aW9uIHJlYWRNY3BEZWZhdWx0UG9ydCgpOiBudW1iZXIge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHBrZ1BhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcGFja2FnZS5qc29uJyk7XG4gICAgICAgIGNvbnN0IHBrZyA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBrZ1BhdGgsICd1dGY4JykpIGFzIHsgbWNwRGVmYXVsdFBvcnQ/OiBudW1iZXIgfTtcbiAgICAgICAgaWYgKHR5cGVvZiBwa2cubWNwRGVmYXVsdFBvcnQgPT09ICdudW1iZXInICYmIHBrZy5tY3BEZWZhdWx0UG9ydCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBwa2cubWNwRGVmYXVsdFBvcnQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gcGFja2FnZS5qc29uIHVuYXZhaWxhYmxlIGR1cmluZyBzb21lIHRvb2xpbmcgcnVuc1xuICAgIH1cbiAgICByZXR1cm4gRkFMTEJBQ0tfTUNQX1BPUlQ7XG59XG5cbi8qKiBEZWZhdWx0IE1DUCBIVFRQIHBvcnQgKGZyb20gcGFja2FnZS5qc29uIFwibWNwRGVmYXVsdFBvcnRcIikuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9NQ1BfUE9SVCA9IHJlYWRNY3BEZWZhdWx0UG9ydCgpO1xuXG5mdW5jdGlvbiByZWFkUGFja2FnZVZlcnNpb24oKTogc3RyaW5nIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwa2dQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3BhY2thZ2UuanNvbicpO1xuICAgICAgICBjb25zdCBwa2cgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwa2dQYXRoLCAndXRmOCcpKSBhcyB7IHZlcnNpb24/OiBzdHJpbmcgfTtcbiAgICAgICAgaWYgKHR5cGVvZiBwa2cudmVyc2lvbiA9PT0gJ3N0cmluZycgJiYgcGtnLnZlcnNpb24ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHBrZy52ZXJzaW9uO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIHBhY2thZ2UuanNvbiB1bmF2YWlsYWJsZSBkdXJpbmcgc29tZSB0b29saW5nIHJ1bnNcbiAgICB9XG4gICAgcmV0dXJuICcwLjAuMCc7XG59XG5cbi8qKiBFeHRlbnNpb24gdmVyc2lvbiAoZnJvbSBwYWNrYWdlLmpzb24gXCJ2ZXJzaW9uXCIpLiAqL1xuZXhwb3J0IGNvbnN0IFBBQ0tBR0VfVkVSU0lPTiA9IHJlYWRQYWNrYWdlVmVyc2lvbigpO1xuIl19