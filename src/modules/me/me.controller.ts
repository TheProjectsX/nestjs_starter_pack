import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Patch,
    Req,
    UploadedFiles,
    UseInterceptors,
} from "@nestjs/common";
import { MeService } from "./me.service";
import { ResponseService } from "@/utils/response";
import { CustomFileFieldsInterceptor } from "@/helper/file_interceptor";
import { ParseFormDataInterceptor } from "@/helper/form_data_interceptor";
import { UpdateProfileDto } from "./dto/updateProfile.dto";
import { Request } from "express";
import { UserPayload } from "@/guards/auth.guard";

@Controller("me")
export class MeController {
    constructor(private meService: MeService) {}

    @Get("")
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
    @UseInterceptors(
        CustomFileFieldsInterceptor([{ name: "avatar", maxCount: 1 }]),
        ParseFormDataInterceptor,
    )
    async updateProfile(
        @Body() payload: UpdateProfileDto,
        @Req() req: Request,
        @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    ) {
        if (files?.avatar) {
            payload.avatar = files.avatar[0].filename;
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
