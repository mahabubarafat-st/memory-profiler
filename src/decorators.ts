import { logMemoryUsageAsync, logMemoryUsageSync, isMemoryProfilingEnabled } from './utilities';
import { SyncFunction, AsyncFunction } from './types';

// Decorator for profiling all methods in a service
export function ProfileAllMethods(): ClassDecorator {
    return function (constructor: Function): void {
        if (isMemoryProfilingEnabled()) {
            const methodNames = Object.getOwnPropertyNames(constructor.prototype)
                .filter((prop) => typeof constructor.prototype[prop] === 'function' && prop !== 'constructor');

            const asyncMethods: string[] = [];
            const syncMethods: string[] = [];

            // Separate async and sync methods
            for (const methodName of methodNames) {
                const originalMethod = constructor.prototype[methodName];
                if (originalMethod.constructor.name === 'AsyncFunction') {
                    asyncMethods.push(methodName);
                } else {
                    syncMethods.push(methodName);
                }
            }

            // Apply memory profiling for async methods
            for (const methodName of asyncMethods) {
                const originalMethod: AsyncFunction = constructor.prototype[methodName];
                constructor.prototype[methodName] = logMemoryUsageAsync(originalMethod);
            }

            // Apply memory profiling for sync methods
            for (const methodName of syncMethods) {
                const originalMethod: SyncFunction = constructor.prototype[methodName];
                constructor.prototype[methodName] = logMemoryUsageSync(originalMethod);
            }
        }
    };
}

// for a single sync Function
export function ProfileMemorySyncFunction() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // Only apply profiling if enabled
        if (isMemoryProfilingEnabled()) {
            const originalMethod = descriptor.value;

            // Wrap the original method with memory profiling
            descriptor.value = logMemoryUsageSync(originalMethod);
        }

        return descriptor;
    };
}

// for a single async Function
export function ProfileMemoryAsyncFunction() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // Only apply profiling if enabled
        if (isMemoryProfilingEnabled()) {
            const originalMethod = descriptor.value;

            // Wrap the original method with memory profiling
            descriptor.value = logMemoryUsageAsync(originalMethod);
        }

        return descriptor;
    };
}
