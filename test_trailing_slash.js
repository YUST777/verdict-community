
const { extractAndParseJson } = require('./src/lib/json-utils');

const truncatedJson = '{"solution": "int main() { printf(\\"Hello World\\", "';
const truncatedJsonWithSlash = '{"solution": "return a.end < b.end;\\\\';

function runTest(jsonString, name) {
    try {
        console.log("Testing:", name);
        const parsed = extractAndParseJson(jsonString);
        console.log("✅ Success! Repaired JSON keys:", Object.keys(parsed));
    } catch (e) {
        console.error("❌ Failed:", e.message);
        process.exit(1);
    }
}

runTest(truncatedJson, "Standard truncation");
runTest(truncatedJsonWithSlash, "Truncation with trailing slash");
