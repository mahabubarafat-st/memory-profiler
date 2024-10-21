export interface MemoryUsageResult {
    startMemory: number;
    endMemory: number;
    memoryConsumed: number;
    executionTime: number;
}

export type SyncFunction = (...args: any[]) => any;
export type AsyncFunction = (...args: any[]) => Promise<any>;
