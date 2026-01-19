import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Patch,
    Req,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { MeService } from "./me.service";
import { ResponseService } from "@/utils/response";
import { CustomFileInterceptor } from "@/helper/files/file_interceptors";
import { ParseFormDataInterceptor } from "@/helper/form_data_interceptor";
import { UpdateProfileDto } from "./dto/updateProfile.dto";
import { Request } from "express";
import { UserPayload } from "@/guards/auth.guard";
import { ApiOperation } from "@nestjs/swagger";

@Controller("me")
export class MeController {
    constructor(private meService: MeService) {}

    @Get("")
    @ApiOperation({ summary: "Get user profile" })
    async getProfile(@Req() req: Request) {
        const user = req.user as UserPayload;
        const result = await this.meService.getProfile(user);

        return ResponseService.formatResponse({
            statusCode: HttpStatus.OK,
            message: "User data retrieved",
            data: result,
        });
    }

    @Patch("")
    @UseInterceptors(CustomFileInterceptor("avatar"), ParseFormDataInterceptor)
    @ApiOperation({ summary: "Update user profile" })
    async updateProfile(
        @Body() payload: UpdateProfileDto,
        @Req() req: Request,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (file) {
            payload.avatar = file.filename;
        }

        const user = req.user as UserPayload;
        const result = await this.meService.updateProfile(payload, user);

        return ResponseService.formatResponse({
            statusCode: HttpStatus.OK,
            message: "User data updated",
            data: result,
        });
    }
}
