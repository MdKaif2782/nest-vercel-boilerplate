"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
let FirebaseService = class FirebaseService {
    async sayMyName() {
        const message = {
            topic: 'test',
            android: {
                priority: 'high',
            },
            data: {
                test: 'Hello, World!',
            },
        };
        return await firebase_admin_1.default
            .messaging()
            .send(message)
            .then((response) => {
            return { message: 'Successfully sent message:', response: response };
        });
    }
    async validateToken(token) {
        return await firebase_admin_1.default
            .auth()
            .verifyIdToken(token)
            .then((decodedToken) => {
            console.log(decodedToken);
            return true;
        })
            .catch((error) => {
            throw new common_1.UnauthorizedException({
                message: 'Unauthorized',
                error: error,
            });
        });
    }
    async getCustomerIdFromToken(request) {
        const token = request.headers['authorization'].split(' ')[1];
        return await firebase_admin_1.default
            .auth()
            .verifyIdToken(token)
            .then((decodedToken) => {
            return decodedToken.uid;
        })
            .catch((error) => {
            throw new common_1.UnauthorizedException({
                message: 'Unauthorized',
                error: error,
            });
        });
    }
    async sendNotificationToTopic(topic, data, notification) {
        const message = {
            topic: topic,
            android: {
                priority: 'high',
            },
            data: data,
            notification: notification,
        };
        return await firebase_admin_1.default
            .messaging()
            .send(message)
            .then((response) => {
            return { message: 'Successfully sent message:', response: response };
        });
    }
    async sendTestNotification() {
        const message = {
            topic: 'test',
            android: {
                priority: 'high',
            },
            notification: {
                title: 'Hello, World!',
                body: 'This is a test notification!',
            },
        };
        return await firebase_admin_1.default
            .messaging()
            .send(message)
            .then((response) => {
            return { message: 'Successfully sent message:', response: response };
        });
    }
    async sendNotificationToToken(token, data, notification) {
        const message = {
            token: token,
            android: {
                priority: 'high',
            },
            data: data,
            notification: notification,
        };
        return await firebase_admin_1.default
            .messaging()
            .send(message)
            .then((response) => {
            return { message: 'Successfully sent message:', response: response };
        });
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = __decorate([
    (0, common_1.Injectable)()
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map