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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const argon2_1 = require("argon2");
const jwt_1 = require("@nestjs/jwt");
const database_service_1 = require("../database/database.service");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    constructor(configService, databaseService, jwtService) {
        this.configService = configService;
        this.databaseService = databaseService;
        this.jwtService = jwtService;
    }
    async registerLocal(user) {
        user.password = await this.createHash(user.password);
        const foundUser = await this.databaseService.user.findUnique({
            where: {
                email: user.email
            }
        });
        if (foundUser) {
            throw new common_1.ForbiddenException("Your email is already registered");
        }
        const newUser = await this.databaseService.user.create({
            data: {
                email: user.email,
                password: user.password
            }
        });
        const { accessToken, refreshToken } = await this.generateTokens({
            id: newUser.id
        });
        await this.storeRefreshToken({
            id: newUser.id,
            refreshToken
        });
        return { accessToken, refreshToken };
    }
    async logInLocal(user) {
        const foundUser = await this.databaseService.user.findUnique({
            where: {
                email: user.email
            }
        });
        if (!foundUser) {
            throw new common_1.ForbiddenException("User is not registered");
        }
        const isPasswordCorrect = await this.verifyHash(foundUser.password, user.password);
        if (!isPasswordCorrect) {
            throw new common_1.ForbiddenException("Incorrect password");
        }
        const { accessToken, refreshToken } = await this.generateTokens({
            id: foundUser.id
        });
        await this.storeRefreshToken({
            id: foundUser.id,
            refreshToken
        });
        return { id: foundUser.id, accessToken, refreshToken };
    }
    async logOut(user) {
        const foundUser = await this.databaseService.user.findUnique({
            where: {
                id: user.id
            }
        });
        if (!foundUser) {
            throw new common_1.ForbiddenException("User is not registered");
        }
        if (!foundUser.refreshToken) {
            throw new common_1.ForbiddenException("Already logged out");
        }
        await this.databaseService.user.update({
            where: {
                id: user.id
            },
            data: {
                refreshToken: null
            }
        });
    }
    async refreshToken(user) {
        const foundUser = await this.databaseService.user.findUnique({
            where: {
                id: user.id
            }
        });
        if (!foundUser) {
            throw new common_1.ForbiddenException("User is not registered");
        }
        if (!foundUser.refreshToken) {
            throw new common_1.UnauthorizedException("Invalid refresh token");
        }
        const isRefreshTokenValid = await this.verifyHash(foundUser.refreshToken, user.refreshToken);
        if (!isRefreshTokenValid) {
            throw new common_1.UnauthorizedException("Invalid refresh token");
        }
        const { accessToken, refreshToken } = await this.generateTokens({
            id: foundUser.id
        });
        await this.storeRefreshToken({
            id: foundUser.id,
            refreshToken
        });
        return { accessToken, refreshToken };
    }
    async storeRefreshToken(user) {
        user.refreshToken = await this.createHash(user.refreshToken);
        await this.databaseService.user.update({
            where: {
                id: user.id
            },
            data: {
                refreshToken: user.refreshToken
            }
        });
    }
    async generateTokens(payload) {
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get("ACCESS_KEY"),
            expiresIn: "1d"
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get("REFRESH_KEY"),
            expiresIn: "7d"
        });
        return { accessToken, refreshToken };
    }
    async createHash(inputString) {
        return await (0, argon2_1.hash)(inputString);
    }
    async verifyHash(referenceHash, inputString) {
        return await (0, argon2_1.verify)(referenceHash, inputString);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        database_service_1.DatabaseService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map