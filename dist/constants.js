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
exports.DEFAULT_MCP_PORT = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc291cmNlL2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBRTdCLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxDQUFDO0FBRWhDLFNBQVMsa0JBQWtCO0lBQ3ZCLElBQUksQ0FBQztRQUNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDeEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBZ0MsQ0FBQztRQUN4RixJQUFJLE9BQU8sR0FBRyxDQUFDLGNBQWMsS0FBSyxRQUFRLElBQUksR0FBRyxDQUFDLGNBQWMsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNuRSxPQUFPLEdBQUcsQ0FBQyxjQUFjLENBQUM7UUFDOUIsQ0FBQztJQUNMLENBQUM7SUFBQyxXQUFNLENBQUM7UUFDTCxvREFBb0Q7SUFDeEQsQ0FBQztJQUNELE9BQU8saUJBQWlCLENBQUM7QUFDN0IsQ0FBQztBQUVELGtFQUFrRTtBQUNyRCxRQUFBLGdCQUFnQixHQUFHLGtCQUFrQixFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5jb25zdCBGQUxMQkFDS19NQ1BfUE9SVCA9IDI4NDczO1xuXG5mdW5jdGlvbiByZWFkTWNwRGVmYXVsdFBvcnQoKTogbnVtYmVyIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwa2dQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3BhY2thZ2UuanNvbicpO1xuICAgICAgICBjb25zdCBwa2cgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwa2dQYXRoLCAndXRmOCcpKSBhcyB7IG1jcERlZmF1bHRQb3J0PzogbnVtYmVyIH07XG4gICAgICAgIGlmICh0eXBlb2YgcGtnLm1jcERlZmF1bHRQb3J0ID09PSAnbnVtYmVyJyAmJiBwa2cubWNwRGVmYXVsdFBvcnQgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gcGtnLm1jcERlZmF1bHRQb3J0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIHBhY2thZ2UuanNvbiB1bmF2YWlsYWJsZSBkdXJpbmcgc29tZSB0b29saW5nIHJ1bnNcbiAgICB9XG4gICAgcmV0dXJuIEZBTExCQUNLX01DUF9QT1JUO1xufVxuXG4vKiogRGVmYXVsdCBNQ1AgSFRUUCBwb3J0IChmcm9tIHBhY2thZ2UuanNvbiBcIm1jcERlZmF1bHRQb3J0XCIpLiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfTUNQX1BPUlQgPSByZWFkTWNwRGVmYXVsdFBvcnQoKTtcbiJdfQ==