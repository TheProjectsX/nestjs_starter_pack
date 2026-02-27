import { PrismaService } from "@/helper/prisma.service";
import { HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ApiError } from "src/utils/api_error";
import { BcryptService } from "src/utils/bcrypt.service";
import { generateOTP } from "./auth.utils";
import config from "@/config";
import {
    generateForgetPasswordTemplate,
    generateForgotPasswordOTPTemplate,
    generateVerifyOTPTemplate,
} from "./auth.template";
import emailSender from "@/utils/email/nodemailer";
import { JwtPayload } from "@/interface/jwtPayload";
import {
    ChangePasswordDto,
    LoginUserDto,
    RegisterUserDto,
    ResetPasswordDto,
    VerifyOtpDto,
} from "./dto/body.dto";

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private bcryptService: BcryptService,
        private prisma: PrismaService,
    ) {}

    async register(payload: RegisterUserDto) {
        const userData = await this.prisma.user.findFirst({
            where: { email: payload.email, verified: true },
        });

        if (userData) {
            throw new ApiError(
                HttpStatus.CONFLICT,
                "User with this Email already exists!",
            );
        }

        const { otp, otpExpiry } = generateOTP();

        const hashedPassword: string = await this.bcryptService.hash(
            payload.password,
            config.password.salt,
        );
        const response = await this.prisma.user.create({
            data: {
                email: payload.email,
                otp,
                otpExpiry,
                password: hashedPassword,
                profile: {
                    create: {
                        name: payload.name,
                        phone: payload.phone,
                    },
                },
            },
            omit: { password: true },
        });

        const html = generateVerifyOTPTemplate(otp);
        await emailSender({
            email: response.email,
            subject: `Account Verification Code - ${config.company_name}`,
            html,
        });

        return {
            message: "Verification code sent",
        };
    }

    async loginWithEmail(payload: LoginUserDto) {
        const userData = await this.prisma.user.findFirst({
            where: {
                email: payload.email,
                verified: true,
            },
        });
        if (!userData) {
            throw new ApiError(400, "Invalid Credentials");
        }

        if (!payload.password || !userData?.password) {
            throw new ApiError(400, "Invalid Credentials");
        }

        const passwordMatched = await this.bcryptService.compare(
            payload.password,
            userData.password,
        );

        if (!passwordMatched) {
            throw new ApiError(400, "Invalid Credentials");
        }

        if (userData.status === "INACTIVE")
            throw new ApiError(
                HttpStatus.FORBIDDEN,
                "This account is Inactive",
            );
        if (userData.deleted) throw new ApiError(400, "Invalid Credentials");

        if (!userData?.verified) {
            const { otp, otpExpiry } = generateOTP();

            await this.prisma.user.update({
                where: {
                    id: userData.id,
                },
                data: { otp, otpExpiry },
            });

            const html = generateVerifyOTPTemplate(otp);
            await emailSender({
                email: userData.email,
                subject: `Account Verification Code - ${config.company_name}`,
                html,
            });

            throw new ApiError(
                HttpStatus.FORBIDDEN,
                "Check Email and Verify your account first!",
            );
        }

        const jwtPayload = {
            id: userData.id,
            email: userData.email,
            role: userData.role,
        } satisfies JwtPayload;

        const accessToken = this.jwtService.sign(jwtPayload, {
            secret: config.jwt.jwt_secret,
            expiresIn: config.jwt.jwt_secret_expires_in,
        });
        const refreshToken = this.jwtService.sign(jwtPayload, {
            secret: config.jwt.refresh_token_secret,
            expiresIn: config.jwt.refresh_token_expires_in,
        });

        return {
            message: "Login successful",
            data: {
                refreshToken,
                accessToken,
            },
        };
    }

    async sendOTP(payload: { email: string }) {
        const userData = await this.prisma.user.findFirst({
            where: {
                email: payload.email,
            },
        });

        if (!userData) {
            throw new ApiError(404, "User not found");
        }
        if (userData.verified) {
            throw new ApiError(
                HttpStatus.BAD_REQUEST,
                "Account already verified",
            );
        }

        const { otp, otpExpiry } = generateOTP();

        await this.prisma.user.update({
            where: {
                id: userData.id,
            },
            data: { otp, otpExpiry },
        });

        const html = generateVerifyOTPTemplate(otp);
        await emailSender({
            email: userData.email,
            subject: `Account Verification Code - ${config.company_name}`,
            html,
        });

        return {
            message: "OTP Resent Successfully!",
        };
    }

    async verifyOTP(payload: VerifyOtpDto) {
        const userData = await this.prisma.user.findFirst({
            where: {
                email: payload.email,
            },
        });

        if (!userData) {
            throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
        }

        if (userData.otp !== payload.otp) {
            throw new ApiError(HttpStatus.FORBIDDEN, "Incorrect OTP");
        }

        if (userData.otpExpiry && userData.otpExpiry < new Date()) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "OTP expired");
        }

        await this.prisma.user.update({
            where: {
                id: userData.id,
            },
            data: {
                otp: null,
                otpExpiry: null,
                verified: true,
            },
        });

        // Delete other users with the same email but not verified
        await this.prisma.user.deleteMany({
            where: {
                id: {
                    not: userData.id,
                },
                email: userData.email,
                verified: false,
            },
        });

        return {
            message: "OTP Verification successful",
        };
    }

    async sendForgotPasswordOtp(payload: { email: string }) {
        const userData = await this.prisma.user.findFirst({
            where: {
                email: payload.email,
            },
        });

        if (!userData) {
            throw new ApiError(404, "User not found");
        }

        const { otp, otpExpiry } = generateOTP();

        await this.prisma.user.update({
            where: {
                id: userData.id,
            },
            data: { otp, otpExpiry },
        });

        const html = generateForgotPasswordOTPTemplate(otp);
        await emailSender({
            email: userData.email,
            subject: `Password Reset OTP - ${config.company_name}`,
            html: html,
        });

        return {
            message: "Password Reset OTP Sent Successfully!",
        };
    }

    async verifyForgotPasswordOTP(payload: VerifyOtpDto) {
        const userData = await this.prisma.user.findFirst({
            where: {
                email: payload.email,
            },
        });

        if (!userData) {
            throw new ApiError(404, "User not found");
        }

        if (userData.otp !== payload.otp) {
            throw new ApiError(404, "Incorrect OTP");
        }

        if (userData.otpExpiry && userData.otpExpiry < new Date()) {
            throw new ApiError(400, "OTP expired");
        }

        const jwtPayload = { email: userData.email, otp: userData.otp };

        const resetPassToken = this.jwtService.sign(jwtPayload, {
            secret: config.jwt.reset_token_secret,
            expiresIn: config.jwt.reset_token_expires_in,
        });

        return {
            message: "OTP Verification successful",
            data: { token: resetPassToken },
        };
    }

    async changePassword(payload: ChangePasswordDto, user: JwtPayload) {
        if (!payload.oldPassword || !payload.newPassword) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid Body Provided");
        }

        const userData = await this.prisma.user.findUnique({
            where: { id: user.id },
        });

        if (!userData) {
            throw new ApiError(HttpStatus.NOT_FOUND, "User not found!");
        }

        if (!userData?.password) {
            throw new ApiError(
                HttpStatus.UNAUTHORIZED,
                "Unauthenticated Request!",
            );
        }

        const passwordValid = await this.bcryptService.compare(
            payload.oldPassword,
            userData?.password,
        );

        if (!passwordValid) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "Incorrect Password");
        }

        const hashedPassword = await this.bcryptService.hash(
            payload.newPassword,
            config.password.salt,
        );

        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                password: hashedPassword,
            },
        });
        return { message: "Password Changed successfully" };
    }

    async forgotPassword(payload: { email: string }) {
        const userData = await this.prisma.user.findFirst({
            where: {
                email: payload.email,
                verified: true,
            },
        });
        if (!userData) {
            throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
        }

        const jwtPayload = { email: userData.email, role: userData.role };
        const resetPassToken = this.jwtService.sign(jwtPayload, {
            secret: config.jwt.reset_token_secret,
            expiresIn: config.jwt.reset_token_expires_in,
        });

        const resetPassLink =
            config.url.reset_pass +
            `?userId=${userData.id}&token=${resetPassToken}`;

        const html = generateForgetPasswordTemplate(resetPassLink);
        await emailSender({
            email: userData.email,
            subject: `Password Reset Request - ${config.company_name}`,
            html,
        });

        return {
            message: "Password Reset Instructions sent to Email",
        };
    }

    async refreshToken(payload: { refreshToken: string }) {
        if (!payload.refreshToken) {
            throw new ApiError(
                HttpStatus.BAD_REQUEST,
                "refreshToken is required",
            );
        }

        let decrypted: JwtPayload | undefined;
        try {
            decrypted = this.jwtService.verify(payload.refreshToken, {
                secret: config.jwt.refresh_token_secret,
            });
        } catch {
            throw new ApiError(
                HttpStatus.BAD_REQUEST,
                "Refresh Token is Invalid or Expired",
            );
        }

        const userData = await this.prisma.user.findUnique({
            where: { id: decrypted.id },
        });

        if (!userData) {
            throw new ApiError(
                HttpStatus.UNAUTHORIZED,
                "Unauthenticated Request",
            );
        }

        const jwtPayload = {
            id: userData.id,
            role: userData.role,
            email: userData.email,
        };

        const accessToken = this.jwtService.sign(jwtPayload, {
            secret: config.jwt.jwt_secret,
            expiresIn: config.jwt.jwt_secret_expires_in,
        });

        return {
            data: { accessToken },
            message: "Access Token generated",
        };
    }

    async resetPassword(payload: ResetPasswordDto) {
        let decrypted: JwtPayload | undefined;

        try {
            decrypted = this.jwtService.verify(payload.token, {
                secret: config.jwt.reset_token_secret,
            });
        } catch {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid Token");
        }

        const userData = await this.prisma.user.findFirst({
            where: {
                email: decrypted.email,
                verified: true,
            },
        });

        if (!userData) {
            throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
        }

        const password = await this.bcryptService.hash(
            payload.password,
            config.password.salt,
        );

        await this.prisma.user.update({
            where: {
                id: userData.id,
            },
            data: {
                password,
            },
        });
        return { message: "Password Reset successful" };
    }
}
