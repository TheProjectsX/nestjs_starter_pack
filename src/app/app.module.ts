import { PrismaService } from "@/helper/prisma.service";
import { AuthModule } from "@/modules/auth/auth.module";
import { BcryptService } from "@/utils/bcrypt.service";
import { GlobalExceptionFilter } from "@/utils/global_exception";
// import { WebsocketGateway } from "@/ws/socket.io.service";
import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { FileService } from "@/helper/files/cloudinary.service";
import { PrismaHelperService } from "@/utils/is_existance";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AuthGuard } from "@/guards/auth.guard";
import { ConfigModule } from "@nestjs/config";
import config from "@/config";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [() => config],
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "..", "uploads"),
            serveRoot: "/uploads",
        }),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    name: "short",
                    ttl: 1000,
                    limit: 100,
                },
                {
                    name: "medium",
                    ttl: 10000,
                    limit: 1000,
                },
                {
                    name: "long",
                    ttl: 600000,
                    limit: 1000,
                },
            ],
        }),
        AuthModule,
    ],
    controllers: [AppController],
    providers: [
        PrismaService,
        BcryptService,
        FileService,
        PrismaHelperService,
        // WebsocketGateway,
        { provide: APP_FILTER, useClass: GlobalExceptionFilter },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_GUARD, useClass: AuthGuard },
    ],
})
export class AppModule {}
