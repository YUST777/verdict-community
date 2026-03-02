"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFile = void 0;
const https_1 = __importDefault(require("https"));
const node_http_1 = __importDefault(require("node:http"));
const redirect_status_codes_1 = require("../redirect-status-codes");
const truthy_1 = require("../truthy");
const getClient = (url) => {
    if (url.startsWith('https://')) {
        return https_1.default.get;
    }
    if (url.startsWith('http://')) {
        return node_http_1.default.get;
    }
    throw new Error(`Can only download URLs starting with http:// or https://, got "${url}"`);
};
const readFileWithoutRedirect = (url) => {
    return new Promise((resolve, reject) => {
        const client = getClient(url);
        const req = client(url, 
        // Bun 1.1.16 does not support the `headers` option
        typeof Bun === 'undefined'
            ? {
                headers: {
                    'user-agent': 'Mozilla/5.0 (@remotion/renderer - https://remotion.dev)',
                },
            }
            : {}, (res) => {
            resolve({ request: req, response: res });
        });
        req.on('error', (err) => {
            req.destroy();
            return reject(err);
        });
    });
};
const readFile = async (url, redirectsSoFar = 0) => {
    if (redirectsSoFar > 10) {
        throw new Error(`Too many redirects while downloading ${url}`);
    }
    const { request, response } = await readFileWithoutRedirect(url);
    if (redirect_status_codes_1.redirectStatusCodes.includes(response.statusCode)) {
        if (!response.headers.location) {
            throw new Error(`Received a status code ${response.statusCode} but no "Location" header while calling ${response.headers.location}`);
        }
        const { origin } = new URL(url);
        const redirectUrl = new URL(response.headers.location, origin).toString();
        request.destroy();
        response.destroy();
        return (0, exports.readFile)(redirectUrl, redirectsSoFar + 1);
    }
    if (response.statusCode >= 400) {
        const body = await tryToObtainBody(response);
        request.destroy();
        response.destroy();
        throw new Error([
            `Received a status code of ${response.statusCode} while downloading file ${url}.`,
            body ? `The response body was:` : null,
            body ? `---` : null,
            body ? body : null,
            body ? `---` : null,
        ]
            .filter(truthy_1.truthy)
            .join('\n'));
    }
    return { request, response };
};
exports.readFile = readFile;
const tryToObtainBody = async (file) => {
    const success = new Promise((resolve) => {
        let data = '';
        file.on('data', (chunk) => {
            data += chunk;
        });
        file.on('end', () => {
            resolve(data);
        });
        // OK even when getting an error, this is just a best effort
        file.on('error', () => resolve(data));
    });
    let timeout = null;
    const body = await Promise.race([
        success,
        new Promise((resolve) => {
            timeout = setTimeout(() => {
                resolve(null);
            }, 5000);
        }),
    ]);
    if (timeout) {
        clearTimeout(timeout);
    }
    return body;
};
