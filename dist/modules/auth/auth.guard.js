"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenGuard = exports.AccessTokenGuard = void 0;
const passport_1 = require("@nestjs/passport");
class AccessTokenGuard extends (0, passport_1.AuthGuard)("jwt") {
    constructor() {
        super();
    }
}
exports.AccessTokenGuard = AccessTokenGuard;
class RefreshTokenGuard extends (0, passport_1.AuthGuard)("jwt-refresh") {
    constructor() {
        super();
    }
}
exports.RefreshTokenGuard = RefreshTokenGuard;
//# sourceMappingURL=auth.guard.js.map