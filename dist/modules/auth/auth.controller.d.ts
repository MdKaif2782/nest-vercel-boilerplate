import { AuthService } from "./auth.service";
import { LoginLocalBody, RegisterLocalBody } from "./auth.dto";
import { Request } from "express";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    registerLocal(body: RegisterLocalBody): Promise<{
        accessToken: string;
        refreshToken: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    logInLocal(body: LoginLocalBody): Promise<{
        id: string;
        accessToken: string;
        refreshToken: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    logOut(req: Request): Promise<void>;
    refreshToken(req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(req: Request): Promise<{
        id: string;
    }>;
}
