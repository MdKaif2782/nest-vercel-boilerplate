"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const common_1 = require("@nestjs/common");
const firebase_admin_1 = require("firebase-admin");
exports.User = (0, common_1.createParamDecorator)(async (data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.headers.authorization.split(' ')[1];
    try {
        const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(token);
        return decodedToken;
    }
    catch (error) {
        throw new common_1.UnauthorizedException('Invalid token');
    }
});
//# sourceMappingURL=user.decorator.js.map