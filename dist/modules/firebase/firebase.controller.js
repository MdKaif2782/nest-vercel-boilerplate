"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseController = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("./firebase.service");
const access_token_guard_1 = require("../../middlewares/access-token.guard");
let FirebaseController = class FirebaseController {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async sayMyName() {
        return await this.firebaseService.sayMyName();
    }
    async sendTestNotification() {
        return await this.firebaseService.sendTestNotification();
    }
    async sendNotificationToToken(body) {
        return await this.firebaseService.sendNotificationToToken(body.token, body.data, body.notification);
    }
    async testAuth() {
        return { message: 'Authentication passed' };
    }
};
exports.FirebaseController = FirebaseController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FirebaseController.prototype, "sayMyName", null);
__decorate([
    (0, common_1.Get)('test-notification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FirebaseController.prototype, "sendTestNotification", null);
__decorate([
    (0, common_1.Post)('to-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FirebaseController.prototype, "sendNotificationToToken", null);
__decorate([
    (0, common_1.Get)('auth/test'),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FirebaseController.prototype, "testAuth", null);
exports.FirebaseController = FirebaseController = __decorate([
    (0, common_1.Controller)('firebase'),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirebaseController);
//# sourceMappingURL=firebase.controller.js.map