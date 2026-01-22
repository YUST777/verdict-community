/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const DIRS_TO_SCAN = ['app', 'lib', 'components', 'utils', 'hooks', 'contexts'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function nukeLogs(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            nukeLogs(fullPath);
        } else if (EXTENSIONS.includes(path.extname(fullPath))) {
            let content = fs.readFileSync(fullPath, 'utf8');

            // Regex to find console.log(...) calls
            // handles simple nested parenthesis: console.log(fn(a))
            // This is not a perfect parser but works for 99% of "dump shit" logs.
            const logRegex = /console\.log\s*\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)[\s;]*/g;

            if (logRegex.test(content)) {
                console.log(`Cleaning: ${fullPath}`);
                const newContent = content.replace(logRegex, '');
                fs.writeFileSync(fullPath, newContent, 'utf8');
            }
        }
    }
}

console.log('Starting console.log nuke...');
for (const dir of DIRS_TO_SCAN) {
    const targetDir = path.join(process.cwd(), dir);
    nukeLogs(targetDir);
}
console.log('Nuke complete.');
