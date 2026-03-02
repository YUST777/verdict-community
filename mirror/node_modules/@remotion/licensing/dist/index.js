"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicensingInternals = exports.getUsage = exports.registerUsageEvent = void 0;
const register_usage_event_1 = require("./register-usage-event");
const register_usage_event_2 = require("./register-usage-event");
Object.defineProperty(exports, "registerUsageEvent", { enumerable: true, get: function () { return register_usage_event_2.registerUsageEvent; } });
const get_usage_1 = require("./get-usage");
Object.defineProperty(exports, "getUsage", { enumerable: true, get: function () { return get_usage_1.getUsage; } });
exports.LicensingInternals = {
    internalRegisterUsageEvent: register_usage_event_1.internalRegisterUsageEvent,
};
