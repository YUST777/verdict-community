"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proResProfileOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const validProResProfiles = [
    '4444-xq',
    '4444',
    'hq',
    'standard',
    'light',
    'proxy',
];
let proResProfile;
const cliFlag = 'prores-profile';
exports.proResProfileOption = {
    name: 'ProRes profile',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Set the ProRes profile. This option is only valid if the codec has been set to ",
            jsx_runtime_1.jsx("code", { children: "prores" }),
            ". Possible values:", ' ', validProResProfiles.map((p) => `"${p}"`).join(', '), ". Default:", ' ', jsx_runtime_1.jsx("code", { children: "\"hq\"" }),
            ". See", ' ', jsx_runtime_1.jsx("a", { href: "https://video.stackexchange.com/a/14715", children: "here" }),
            " for an explanation of possible values."] })),
    ssrName: 'proResProfile',
    docLink: 'https://www.remotion.dev/docs/config#setproresprofile',
    type: undefined,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: String(commandLine[cliFlag]),
            };
        }
        if (proResProfile !== undefined) {
            return {
                source: 'config',
                value: proResProfile,
            };
        }
        return {
            source: 'default',
            value: undefined,
        };
    },
    setConfig: (value) => {
        proResProfile = value;
    },
    id: cliFlag,
};
