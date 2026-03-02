"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSequenceStackTraces = exports.getComponentsToAddStacksTo = void 0;
const componentsToAddStacksTo = [];
const getComponentsToAddStacksTo = () => componentsToAddStacksTo;
exports.getComponentsToAddStacksTo = getComponentsToAddStacksTo;
const addSequenceStackTraces = (component) => {
    componentsToAddStacksTo.push(component);
};
exports.addSequenceStackTraces = addSequenceStackTraces;
