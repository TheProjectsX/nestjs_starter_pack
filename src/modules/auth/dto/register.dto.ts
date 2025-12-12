import { IsEmail, IsPhoneNumber, IsString } from "class-validator";

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
