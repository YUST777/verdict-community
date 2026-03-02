import type { Compiler } from 'webpack';
export declare class AllowDependencyExpressionPlugin {
    filter(error: Error): boolean;
    apply(compiler: Compiler): void;
}
