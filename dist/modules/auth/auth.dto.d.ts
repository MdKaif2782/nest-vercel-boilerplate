import { UserRole } from "@prisma/client";
export declare class RegisterLocalBody {
    email: string;
    password: string;
    name: string;
    role: UserRole;
}
export declare class LoginLocalBody {
    email: string;
    password: string;
}
