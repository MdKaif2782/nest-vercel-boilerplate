import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import { ConfigService } from "@nestjs/config";
import { AccessToken } from "./auth.strategy";
export declare class AuthService {
    private configService;
    private databaseService;
    private jwtService;
    constructor(configService: ConfigService, databaseService: DatabaseService, jwtService: JwtService);
    registerLocal(user: Pick<User, "email" | "password" | "name" | "role">): Promise<{
        accessToken: string;
        refreshToken: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    logInLocal(user: Pick<User, "email" | "password" | "name" | "role">): Promise<{
        id: string;
        accessToken: string;
        refreshToken: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    logOut(user: Pick<User, "id">): Promise<void>;
    refreshToken(user: Pick<User, "id" | "refreshToken">): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    storeRefreshToken(user: Pick<User, "id" | "refreshToken">): Promise<void>;
    generateTokens(payload: AccessToken): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    createHash(inputString: string): Promise<string>;
    verifyHash(referenceHash: string, inputString: string): Promise<boolean>;
}
