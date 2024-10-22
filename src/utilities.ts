import * as dotenv from 'dotenv';
dotenv.config();
import pino from 'pino';
import { AsyncFunction, SyncFunction } from './types';

// Logger instance
const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            levelFirst: true,
            translateTime: 'SYS:standard',
        },
    },
});

interface Context {
    // No properties needed
}


// Check if memory profiling is enabled via environment variable
export function isMemoryProfilingEnabled(): boolean {
    const envValue = process.env.ENABLE_MEMORY_PROFILING_DECORATOR;
    return envValue !== undefined && envValue === 'true';
}

// Log memory usage for async functions
export function logMemoryUsageAsync(fn: AsyncFunction): AsyncFunction {
    return async function (this: Context, ...args: any[]): Promise<any> {
        const initialMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        const startTime = Date.now();

        const result = await fn.apply(this, args);

        const finalMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        const executionTime = Date.now() - startTime;
        const memoryConsumed = finalMemoryUsage - initialMemoryUsage;

        logger.warn(` Async -> Function: ${fn.name}, startMemory: ${initialMemoryUsage}, endMemory: ${finalMemoryUsage}, memoryConsumed: ${memoryConsumed.toFixed(2)}, executionTime : ${executionTime} ms`);
        return result;
    };
}

// Log memory usage for sync functions
export function logMemoryUsageSync(fn: SyncFunction): SyncFunction {
    return function (this: Context, ...args: any[]): any {
        const initialMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        const startTime = Date.now();

        const result = fn.apply(this, args);

        const finalMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        const executionTime = Date.now() - startTime;
        const memoryConsumed = finalMemoryUsage - initialMemoryUsage;

        logger.info(` Async -> Function: ${fn.name}, startMemory: ${initialMemoryUsage}, endMemory: ${finalMemoryUsage}, memoryConsumed: ${memoryConsumed.toFixed(2)}, executionTime : ${executionTime} ms`);
        return result;
    };
}
