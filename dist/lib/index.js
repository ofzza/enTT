"use strict";
// enTT lib
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// Import and (re)export base class
var entt_1 = require("./entt");
Object.defineProperty(exports, "EnTT", { enumerable: true, get: function () { return entt_1.EnTT; } });
var internals_1 = require("./entt/internals");
Object.defineProperty(exports, "_undefined", { enumerable: true, get: function () { return internals_1._undefined; } });
// Import and (re)export decorators
tslib_1.__exportStar(require("./decorators"), exports);
//# sourceMappingURL=index.js.map