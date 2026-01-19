import { PrismaService } from "@/helper/prisma.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { BcryptService } from "src/utils/bcrypt.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
    imports: [
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 5,
        }),
        JwtModule.register({ global: true }),
    ],
    providers: [AuthService, BcryptService, PrismaService, ConfigService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
