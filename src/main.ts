import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app/app.module";
import * as fs from "fs";
import * as express from "express";

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
        .setTitle("backend_starter_pack")
        .setDescription("The API Description for Backend Starter Pack")
        .setVersion("1.0")
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document);

    fs.writeFileSync("./swagger-spec.json", JSON.stringify(document));

    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
