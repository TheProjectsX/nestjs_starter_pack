import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./dto/login.dto";
import { IsPublic } from "@/decorators/auth.decorator";
import { Request } from "express";
import { ResponseService } from "@/utils/response";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { RegisterUserDto } from "./dto/register.dto";
import { ChangePasswordDto } from "./dto/changePassword.dto";
import { ResetPasswordDto } from "./dto/resetPassword.dto";
import { JwtPayload } from "@/interface/jwtPayload";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.CREATED)
    @IsPublic()
    @Post("register")
    @ApiOperation({ summary: "Register new User account" })
    async register(@Body() payload: RegisterUserDto) {
        const result = await this.authService.register(payload);

        return ResponseService.formatResponse({
            statusCode: HttpStatus.OK,
            message: "OTP Sent to your Email",
            data: result,
        });
    }

    @HttpCode(HttpStatus.OK)
    @IsPublic()
    @Post("login")
    @ApiOperation({ summary: "Login User" })
    async signIn(@Body() payload: LoginUserDto) {
        const result = await this.authService.loginWithEmail(payload);

        return ResponseService.formatResponse({
            statusCode: HttpStatus.OK,
            message: "User Login successful",
            data: result,
        });
    }

    @Post("change-password")
    async changePassword(
        @Body() payload: ChangePasswordDto,
        @Req() req: Request,
    ) {
        const result = await this.authService.changePassword(
            payload,
            req.user as JwtPayload,
        );

        return ResponseService.formatResponse({
            statusCode: HttpStatus.OK,
            message: "Password Changed successfully",
            data: result,
        });
    }

    @IsPublic()
    @Post("forgot-password")
    async forgotPassword(@Body() payload: { email: string }) {
        const result = await this.authService.forgotPassword(payload);

        return ResponseService.formatResponse({
            statusCode: HttpStatus.OK,
            message: "Password Reset Instructions sent to Email",
            data: result,
        });
    }

    @IsPublic()
    @Post("reset-password")
    async resetPassword(@Body() payload: ResetPasswordDto) {
        const result = await this.authService.resetPassword(payload);

        return ResponseService.formatResponse({
            statusCode: HttpStatus.OK,
            message: "Password Reset successful",
            data: result,
        });
    }
}
