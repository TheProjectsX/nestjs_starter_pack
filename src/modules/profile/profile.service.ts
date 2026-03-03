import { UserPayload } from "@/common/guards/auth.guard";
import { PrismaService } from "@/core/services/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { UpdateProfileDto } from "./dto/updateProfile.dto";
import { deleteFile } from "@/core/services/files/delete_file";

@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) {}

    async getProfile(user: UserPayload) {
        const profile = await this.prisma.user.findUnique({
            where: {
                id: user.id,
            },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                profile: {
                    select: {
                        name: true,
                        phone: true,
                        avatar: true,
                        description: true,
                    },
                },
            },
        });

        return {
            message: "User profile fetched successfully",
            data: profile,
        };
    }

    async updateProfile(payload: UpdateProfileDto, user: UserPayload) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId: user.id },
        });

        await this.prisma.profile.update({
            where: { id: profile.id },
            data: {
                name: payload.name,
                phone: payload.phone,
                description: payload.description,
                avatar: payload.avatar,
            },
        });

        // Delete Avatar
        if (profile.avatar) {
            await deleteFile(profile.avatar);
        }

        return {
            message: "Profile updated successfully",
        };
    }
}
