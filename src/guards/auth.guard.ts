import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "@/decorators/auth.decorator";
import config from "@/config";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException("Invalid Token");
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: config.jwt.jwt_secret,
            });

            request["user"] = payload;
        } catch {
            throw new UnauthorizedException("Invalid token");
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const token = request.headers.authorization;
        return token;
    }
}
