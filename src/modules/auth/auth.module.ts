import { BrevoService } from "@/email/brevo";
import { PrismaService } from "@/helper/prisma.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { BcryptService } from "src/utils/bcrypt.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import config from "@/config";

@Module({
    imports: [
        HttpModule.register({
            timeout: 5000,

            maxRedirects: 5,
        }),
        JwtModule.register({
            global: true,
            secret: config.jwt.jwt_secret,
            signOptions: { expiresIn: "7d" },
        }),
    ],
    providers: [
        AuthService,
        BcryptService,
        PrismaService,
        ConfigService,
        BrevoService,
    ],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
