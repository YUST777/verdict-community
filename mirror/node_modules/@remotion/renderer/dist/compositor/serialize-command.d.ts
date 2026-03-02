import type { CompositorCommand, CompositorCommandSerialized } from './payloads';
export declare const serializeCommand: <Type extends keyof CompositorCommand>(command: Type, params: CompositorCommand[Type]) => CompositorCommandSerialized<Type>;
