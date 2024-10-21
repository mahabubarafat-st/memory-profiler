import { logMemoryUsageAsync, logMemoryUsageSync, isMemoryProfilingEnabled } from './utilities';
import { SyncFunction, AsyncFunction } from './types';

// Decorator for profiling all methods in a class
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

// Decorator for profiling a single method
export function ProfileMemory(): MethodDecorator {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
        if (isMemoryProfilingEnabled()) {
            const originalMethod: SyncFunction | AsyncFunction = descriptor.value;
            descriptor.value = async function (...args: any[]): Promise<any> {
                const result = await logMemoryUsageSync(originalMethod).apply(this, args);
                return result;
            };
        }
        return descriptor;
    };
}
