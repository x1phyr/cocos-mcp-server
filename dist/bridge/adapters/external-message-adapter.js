"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalMessageAdapter = void 0;
exports.normalizeToolResponse = normalizeToolResponse;
function normalizeToolResponse(result) {
    if (result && typeof result === 'object' && 'success' in result) {
        const candidate = result;
        if (typeof candidate.success === 'boolean') {
            return candidate;
        }
        return { success: false, error: 'External provider returned invalid success field' };
    }
    return { success: true, data: result };
}
class ExternalMessageAdapter {
    constructor(payload) {
        var _a;
        const namespace = ((_a = payload.namespace) === null || _a === void 0 ? void 0 : _a.trim()) || payload.providerId;
        this.providerId = payload.providerId;
        this.registration = {
            providerId: payload.providerId,
            namespace,
            invokeMessage: payload.invokeMessage,
            tools: payload.tools.map((t) => (Object.assign({}, t))),
        };
    }
    getRegistration() {
        return this.registration;
    }
    getTools() {
        return this.registration.tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
            namespace: this.registration.namespace,
        }));
    }
    async callTool(shortName, args) {
        try {
            const result = await Editor.Message.request(this.registration.providerId, this.registration.invokeMessage, { tool: shortName, args: args !== null && args !== void 0 ? args : {} });
            return normalizeToolResponse(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `External provider "${this.registration.providerId}" failed: ${message}`,
            };
        }
    }
}
exports.ExternalMessageAdapter = ExternalMessageAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwtbWVzc2FnZS1hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc291cmNlL2JyaWRnZS9hZGFwdGVycy9leHRlcm5hbC1tZXNzYWdlLWFkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBT0Esc0RBU0M7QUFURCxTQUFnQixxQkFBcUIsQ0FBQyxNQUFlO0lBQ2pELElBQUksTUFBTSxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxTQUFTLElBQUksTUFBTSxFQUFFLENBQUM7UUFDOUQsTUFBTSxTQUFTLEdBQUcsTUFBc0IsQ0FBQztRQUN6QyxJQUFJLE9BQU8sU0FBUyxDQUFDLE9BQU8sS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN6QyxPQUFPLFNBQVMsQ0FBQztRQUNyQixDQUFDO1FBQ0QsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLGtEQUFrRCxFQUFFLENBQUM7SUFDekYsQ0FBQztJQUNELE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUMzQyxDQUFDO0FBRUQsTUFBYSxzQkFBc0I7SUFJL0IsWUFBWSxPQUFxQzs7UUFDN0MsTUFBTSxTQUFTLEdBQUcsQ0FBQSxNQUFBLE9BQU8sQ0FBQyxTQUFTLDBDQUFFLElBQUksRUFBRSxLQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUM7UUFDbEUsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxZQUFZLEdBQUc7WUFDaEIsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVO1lBQzlCLFNBQVM7WUFDVCxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWE7WUFDcEMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxtQkFBTSxDQUFDLEVBQUcsQ0FBQztTQUM5QyxDQUFDO0lBQ04sQ0FBQztJQUVELGVBQWU7UUFDWCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDN0IsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDN0IsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1lBQzdCLFNBQVMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVM7U0FDekMsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBRUQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFpQixFQUFFLElBQWE7UUFDM0MsSUFBSSxDQUFDO1lBQ0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FDdkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUMvQixFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksYUFBSixJQUFJLGNBQUosSUFBSSxHQUFJLEVBQUUsRUFBRSxDQUN4QyxDQUFDO1lBQ0YsT0FBTyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBQUMsT0FBTyxLQUFjLEVBQUUsQ0FBQztZQUN0QixNQUFNLE9BQU8sR0FBRyxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkUsT0FBTztnQkFDSCxPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsc0JBQXNCLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxhQUFhLE9BQU8sRUFBRTthQUNsRixDQUFDO1FBQ04sQ0FBQztJQUNMLENBQUM7Q0FDSjtBQTVDRCx3REE0Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUb29sUmVzcG9uc2UgfSBmcm9tICcuLi8uLi90eXBlcyc7XG5pbXBvcnQge1xuICAgIEV4dGVybmFsUHJvdmlkZXJSZWdpc3RyYXRpb24sXG4gICAgUmVnaXN0ZXJFeHRlcm5hbFRvb2xzUGF5bG9hZCxcbn0gZnJvbSAnLi4vLi4vcmVnaXN0cnkvcmVnaXN0ZXItdHlwZXMnO1xuaW1wb3J0IHsgQ29jb3NDYXBhYmlsaXR5UGx1Z2luLCBQcm92aWRlclRvb2xEZWZpbml0aW9uIH0gZnJvbSAnLi4vY2FwYWJpbGl0eS1wbHVnaW4nO1xuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplVG9vbFJlc3BvbnNlKHJlc3VsdDogdW5rbm93bik6IFRvb2xSZXNwb25zZSB7XG4gICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0JyAmJiAnc3VjY2VzcycgaW4gcmVzdWx0KSB7XG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZSA9IHJlc3VsdCBhcyBUb29sUmVzcG9uc2U7XG4gICAgICAgIGlmICh0eXBlb2YgY2FuZGlkYXRlLnN1Y2Nlc3MgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdFeHRlcm5hbCBwcm92aWRlciByZXR1cm5lZCBpbnZhbGlkIHN1Y2Nlc3MgZmllbGQnIH07XG4gICAgfVxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9O1xufVxuXG5leHBvcnQgY2xhc3MgRXh0ZXJuYWxNZXNzYWdlQWRhcHRlciBpbXBsZW1lbnRzIENvY29zQ2FwYWJpbGl0eVBsdWdpbiB7XG4gICAgcmVhZG9ubHkgcHJvdmlkZXJJZDogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgcmVnaXN0cmF0aW9uOiBFeHRlcm5hbFByb3ZpZGVyUmVnaXN0cmF0aW9uO1xuXG4gICAgY29uc3RydWN0b3IocGF5bG9hZDogUmVnaXN0ZXJFeHRlcm5hbFRvb2xzUGF5bG9hZCkge1xuICAgICAgICBjb25zdCBuYW1lc3BhY2UgPSBwYXlsb2FkLm5hbWVzcGFjZT8udHJpbSgpIHx8IHBheWxvYWQucHJvdmlkZXJJZDtcbiAgICAgICAgdGhpcy5wcm92aWRlcklkID0gcGF5bG9hZC5wcm92aWRlcklkO1xuICAgICAgICB0aGlzLnJlZ2lzdHJhdGlvbiA9IHtcbiAgICAgICAgICAgIHByb3ZpZGVySWQ6IHBheWxvYWQucHJvdmlkZXJJZCxcbiAgICAgICAgICAgIG5hbWVzcGFjZSxcbiAgICAgICAgICAgIGludm9rZU1lc3NhZ2U6IHBheWxvYWQuaW52b2tlTWVzc2FnZSxcbiAgICAgICAgICAgIHRvb2xzOiBwYXlsb2FkLnRvb2xzLm1hcCgodCkgPT4gKHsgLi4udCB9KSksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZ2V0UmVnaXN0cmF0aW9uKCk6IEV4dGVybmFsUHJvdmlkZXJSZWdpc3RyYXRpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWdpc3RyYXRpb247XG4gICAgfVxuXG4gICAgZ2V0VG9vbHMoKTogUHJvdmlkZXJUb29sRGVmaW5pdGlvbltdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVnaXN0cmF0aW9uLnRvb2xzLm1hcCgodG9vbCkgPT4gKHtcbiAgICAgICAgICAgIG5hbWU6IHRvb2wubmFtZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0b29sLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHRvb2wuaW5wdXRTY2hlbWEsXG4gICAgICAgICAgICBuYW1lc3BhY2U6IHRoaXMucmVnaXN0cmF0aW9uLm5hbWVzcGFjZSxcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIGFzeW5jIGNhbGxUb29sKHNob3J0TmFtZTogc3RyaW5nLCBhcmdzOiB1bmtub3duKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXG4gICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RyYXRpb24ucHJvdmlkZXJJZCxcbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdHJhdGlvbi5pbnZva2VNZXNzYWdlLFxuICAgICAgICAgICAgICAgIHsgdG9vbDogc2hvcnROYW1lLCBhcmdzOiBhcmdzID8/IHt9IH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gbm9ybWFsaXplVG9vbFJlc3BvbnNlKHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogYEV4dGVybmFsIHByb3ZpZGVyIFwiJHt0aGlzLnJlZ2lzdHJhdGlvbi5wcm92aWRlcklkfVwiIGZhaWxlZDogJHttZXNzYWdlfWAsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuIl19