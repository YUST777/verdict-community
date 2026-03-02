"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableGitSourceOption = void 0;
const DEFAULT = false;
const cliFlag = 'disable-git-source';
exports.disableGitSourceOption = {
    cliFlag,
    description: () => `Disables the Git Source being connected to the Remotion Studio. Clicking on stack traces and certain menu items will be disabled.`,
    docLink: 'https://remotion.dev/docs/bundle',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag]) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        return {
            source: 'default',
            value: DEFAULT,
        };
    },
    name: 'Disable Git source',
    setConfig: () => {
        throw new Error('Not implemented');
    },
    ssrName: 'disableGitSource',
    type: false,
    id: cliFlag,
};
