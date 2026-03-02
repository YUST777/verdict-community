"use strict";
// Suppress the frequent Webpack warnings about serializing large strings in the cache
Object.defineProperty(exports, "__esModule", { value: true });
exports.IgnorePackFileCacheWarningsPlugin = void 0;
class IgnorePackFileCacheWarningsPlugin {
    filter(error) {
        if (error.message.includes('Serializing big strings')) {
            return false;
        }
        return true;
    }
    apply(compiler) {
        compiler.hooks.afterCompile.tap('IgnorePackFileCacheWarningsPlugin', (compilation) => {
            compilation.warnings = compilation.warnings.filter(this.filter);
        });
        compiler.hooks.afterEmit.tap('IgnorePackFileCacheWarningsPlugin', (compilation) => {
            compilation.warnings = compilation.warnings.filter(this.filter);
        });
    }
}
exports.IgnorePackFileCacheWarningsPlugin = IgnorePackFileCacheWarningsPlugin;
