import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app/app.module";
import type { Request, Response } from "express";
import * as express from "express";
import * as os from "os";
import config from "./config";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: new ConsoleLogger({
            prefix: "nestjs_starter_pack",
            logLevels: ["error", "warn", "fatal"],
            timestamp: true,
            json: true,
        }),
        rawBody: true,
    });

    // --- Middlewares & Config ---
    app.use(cookieParser());
    app.use("/api/v1/webhook", express.raw({ type: "application/json" }));
    app.setGlobalPrefix("api/v1");

    // --- CORS ---
    app.enableCors({
        origin: [], // Set specific origins in prod
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Access-Control-Allow-Origin",
        ],
    });

    // --- Health Check ---
    const nativeApp = app.getHttpAdapter().getInstance();
    nativeApp.get("/", (req: Request, res: Response) => {
        res.send({
            success: true,
            message: "El Psy Congroo!",
            server_name: "nestjs_starter_pack",
            server_type: "WEB",
        });
    });

    // --- Global Pipes ---
    app.useGlobalPipes(
        new ValidationPipe({
            disableErrorMessages: false,
            whitelist: true,
            forbidNonWhitelisted: false,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // --- Server Listen ---
    const port = config.port || 5000;
    await app.listen(port);

    // --- Startup Feedback ---
    const interfaces = os.networkInterfaces();
    let localIP = "127.0.0.1";
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]!) {
            if (iface.family === "IPv4" && !iface.internal) {
                localIP = iface.address;
            }
        }
    }

    console.log(`\n🚀 Application is running on:`);
    console.log(`📡 Local:    http://localhost:${port}`);
    console.log(`🌐 Network:  http://${localIP}:${port}`);
    console.log(`📚 Swagger:  http://localhost:${port}/api/v1`);
}

bootstrap();
