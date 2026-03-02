"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaxLambdaMemory = void 0;
const getMaxLambdaMemory = () => {
    if (process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE) {
        return (parseInt(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE, 10) * 1024 * 1024);
    }
    return null;
};
exports.getMaxLambdaMemory = getMaxLambdaMemory;
