import { ComponentTools } from './tools';

let sharedComponentTools: ComponentTools | null = null;

export function getSharedComponentTools(): ComponentTools {
    if (!sharedComponentTools) {
        sharedComponentTools = new ComponentTools();
    }
    return sharedComponentTools;
}
