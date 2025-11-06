import { IsEmail, IsEnum, IsString } from "class-validator"
import { Role } from "./auth.role"
import { UserRole } from "@prisma/client"

export class RegisterLocalBody {
  @IsEmail()
  email: string

  @IsString({})
  password: string

  @IsString()
  name: string

  @IsEnum(UserRole)
  role: UserRole
}

export class LoginLocalBody {
  @IsEmail()
  email: string

  @IsString({})
  password: string

  @IsString()
  name: string

  @IsEnum(UserRole)
  role: UserRole
}
