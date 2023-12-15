"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSafeEnv = void 0;
function getSafeEnv(name) {
    var value = process.env[name];
    if (value === undefined) {
        throw new Error("Missing required environment variable: " + name);
    }
    return value;
}
exports.getSafeEnv = getSafeEnv;
