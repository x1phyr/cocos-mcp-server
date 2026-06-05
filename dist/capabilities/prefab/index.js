"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefabTools = void 0;
exports.createPrefabCapability = createPrefabCapability;
const create_builtin_capability_1 = require("../create-builtin-capability");
const tools_1 = require("./tools");
Object.defineProperty(exports, "PrefabTools", { enumerable: true, get: function () { return tools_1.PrefabTools; } });
function createPrefabCapability() {
    return (0, create_builtin_capability_1.createBuiltinCapability)('prefab', tools_1.PrefabTools);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvY2FwYWJpbGl0aWVzL3ByZWZhYi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSx3REFFQztBQVBELDRFQUF1RTtBQUN2RSxtQ0FBc0M7QUFFN0IsNEZBRkEsbUJBQVcsT0FFQTtBQUVwQixTQUFnQixzQkFBc0I7SUFDbEMsT0FBTyxJQUFBLG1EQUF1QixFQUFDLFFBQVEsRUFBRSxtQkFBVyxDQUFDLENBQUM7QUFDMUQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUJ1aWx0aW5DYXBhYmlsaXR5IH0gZnJvbSAnLi4vY3JlYXRlLWJ1aWx0aW4tY2FwYWJpbGl0eSc7XG5pbXBvcnQgeyBQcmVmYWJUb29scyB9IGZyb20gJy4vdG9vbHMnO1xuXG5leHBvcnQgeyBQcmVmYWJUb29scyB9O1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJlZmFiQ2FwYWJpbGl0eSgpIHtcbiAgICByZXR1cm4gY3JlYXRlQnVpbHRpbkNhcGFiaWxpdHkoJ3ByZWZhYicsIFByZWZhYlRvb2xzKTtcbn1cbiJdfQ==