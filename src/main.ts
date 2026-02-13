import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app/app.module";
import type { Request, Response } from "express";
import * as fs from "fs";
import * as express from "express";
import * as os from "os";

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

    app.enableCors({
        origin: [],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Access-Control-Allow-Origin",
        ],
    });

    // To check the server status
    const nativeApp = app.getHttpAdapter().getInstance();
    nativeApp.get("/", (req: Request, res: Response) => {
        res.send({
            success: true,
            message: "El Psy Congroo!",
            server_name: "nestjs_starter_pack",
            server_type: "WEB",
        });
    });

    app.use("/api/v1/webhook", express.raw({ type: "application/json" }));

    app.setGlobalPrefix("api/v1");

    // validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            disableErrorMessages: false,
            whitelist: true,
            forbidNonWhitelisted: false,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    app.use(cookieParser());

    const configService = app.get(ConfigService);

    const port = configService.get<number>("port") || 5000;

    const config = new DocumentBuilder()
        .setTitle("NestJS Starter Pack")
        .setDescription("The API Description for NestJS Backend Starter Pack")
        .setVersion("1.0")
        .build();

    const document = SwaggerModule.createDocument(app, config);

    // Remove the auto generate "Response" from requests
    for (const path of Object.values(document.paths)) {
        for (const method of Object.values(path)) {
            if (!method.responses) continue;

            method.responses = {};
        }
    }

    SwaggerModule.setup("api/api", app, document);

    fs.writeFileSync("./swagger-spec.json", JSON.stringify(document));

    await app.listen(port);

    // Get local network IP
    const interfaces = os.networkInterfaces();
    let localIP = "127.0.0.1";

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]!) {
            if (iface.family === "IPv4" && !iface.internal) {
                localIP = iface.address;
            }
        }
    }

    console.log(`\nApplication is running on:`);
    console.log(`  localhost: http://localhost:${port}`);
    console.log(`  network:   http://${localIP}:${port}`);
}

bootstrap();
