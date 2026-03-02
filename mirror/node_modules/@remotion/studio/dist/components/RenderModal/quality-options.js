"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQualityOptions = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Checkmark_1 = require("../../icons/Checkmark");
const QUALITY_OPTIONS = [
    { value: 'very-low', label: 'Very Low' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'very-high', label: 'Very High' },
];
const getQualityOptions = (selectedQuality, setQuality) => {
    return QUALITY_OPTIONS.map(({ value, label }) => ({
        label,
        onClick: () => setQuality(value),
        leftItem: selectedQuality === value ? jsx_runtime_1.jsx(Checkmark_1.Checkmark, {}) : null,
        id: value,
        keyHint: null,
        quickSwitcherLabel: null,
        subMenu: null,
        type: 'item',
        value,
    }));
};
exports.getQualityOptions = getQualityOptions;
