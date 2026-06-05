"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerTools = void 0;
exports.createServerCapability = createServerCapability;
const create_builtin_capability_1 = require("../create-builtin-capability");
const tools_1 = require("./tools");
Object.defineProperty(exports, "ServerTools", { enumerable: true, get: function () { return tools_1.ServerTools; } });
function createServerCapability() {
    return (0, create_builtin_capability_1.createBuiltinCapability)('server', tools_1.ServerTools);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvY2FwYWJpbGl0aWVzL3NlcnZlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSx3REFFQztBQVBELDRFQUF1RTtBQUN2RSxtQ0FBc0M7QUFFN0IsNEZBRkEsbUJBQVcsT0FFQTtBQUVwQixTQUFnQixzQkFBc0I7SUFDbEMsT0FBTyxJQUFBLG1EQUF1QixFQUFDLFFBQVEsRUFBRSxtQkFBVyxDQUFDLENBQUM7QUFDMUQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUJ1aWx0aW5DYXBhYmlsaXR5IH0gZnJvbSAnLi4vY3JlYXRlLWJ1aWx0aW4tY2FwYWJpbGl0eSc7XG5pbXBvcnQgeyBTZXJ2ZXJUb29scyB9IGZyb20gJy4vdG9vbHMnO1xuXG5leHBvcnQgeyBTZXJ2ZXJUb29scyB9O1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2VydmVyQ2FwYWJpbGl0eSgpIHtcbiAgICByZXR1cm4gY3JlYXRlQnVpbHRpbkNhcGFiaWxpdHkoJ3NlcnZlcicsIFNlcnZlclRvb2xzKTtcbn1cbiJdfQ==