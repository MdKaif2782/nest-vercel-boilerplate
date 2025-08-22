import { ConfigService } from "@nestjs/config";
import { Request } from "express";
export type AccessToken = {
    id: string;
};
declare const AccessTokenStrategy_base: new (...args: any) => any;
export declare class AccessTokenStrategy extends AccessTokenStrategy_base {
    private readonly configService;
    constructor(configService: ConfigService);
    validate(payload: AccessToken): Promise<AccessToken>;
}
declare const RefreshTokenStrategy_base: new (...args: any) => any;
export declare class RefreshTokenStrategy extends RefreshTokenStrategy_base {
    private readonly configService;
    constructor(configService: ConfigService);
    validate(req: Request, payload: AccessToken): Promise<{
        refreshToken: string;
        id: string;
    }>;
}
export {};
