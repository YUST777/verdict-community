"use strict";
// When Webpack cannot resolve these dependencies, it will not print an error message.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllowDependencyExpressionPlugin = void 0;
// If importing TypeScript, it will give this warning:
// WARNING in ./node_modules/typescript/lib/typescript.js 6304:33-52
// Critical dependency: the request of a dependency is an expression
class AllowDependencyExpressionPlugin {
    filter(error) {
        if (error.message.includes('the request of a dependency is an expression')) {
            return false;
        }
        return true;
    }
    apply(compiler) {
        compiler.hooks.afterCompile.tap('Com', (compilation) => {
            compilation.errors = compilation.errors.filter(this.filter);
        });
        compiler.hooks.afterEmit.tap('AllowOptionalDependenciesPlugin', (compilation) => {
            compilation.errors = compilation.errors.filter(this.filter);
            compilation.warnings = compilation.warnings.filter(this.filter);
        });
    }
}
exports.AllowDependencyExpressionPlugin = AllowDependencyExpressionPlugin;
