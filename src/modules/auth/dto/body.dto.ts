import { IsEmail, IsNumber, IsPhoneNumber, IsString } from "class-validator";

export class RegisterUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsPhoneNumber()
    phone: string;

    @IsString()
    password: string;
}

export class LoginUserDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class ResetPasswordDto {
    @IsString()
    token: string;

    @IsString()
    password: string;
}

export class ChangePasswordDto {
    @IsString()
    oldPassword: string;

    @IsString()
    newPassword: string;
}

export class VerifyOtpDto {
    @IsNumber()
    otp: string;

    @IsEmail()
    email: string;
}
