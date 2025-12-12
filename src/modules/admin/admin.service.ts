import { PrismaService } from '@/helper/prisma.service';
import { IGenericResponse } from '@/interface/common';
import { ApiError } from '@/utils/api_error';
import QueryBuilder from '@/utils/query_builder';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { UpdateAdminDto } from './dto/update-admin.dto';

type DailyCount = {
  date: string;
  tourBookings: number;
  reviews: number;
};
@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) { }

  async findAll(query: Record<string, any>): Promise<IGenericResponse<User[]>> {
    const populateFields = query.populate
      ? query.populate
        .split(',')
        .reduce((acc: Record<string, boolean>, field) => {
          acc[field] = true;
          return acc;
        }, {})
      : {};

    const queryBuilder = new QueryBuilder(this.prisma.user, query);
    const result = await queryBuilder
      .range()
      .search([])
      .filter([], [])
      .sort()
      .paginate()
      .fields()
      .rawFilter({ role: Role.ADMIN })
      .populate(populateFields)
      .execute();

    const meta = await queryBuilder.countTotal();

    return { meta, data: result };
  }

  async findOne(id: string) {
    let isAdminExists = await this.prisma.admin
      .findUniqueOrThrow({
        where: { id },
      })
      .catch(() => null);

    if (!isAdminExists) {
      isAdminExists = await this.prisma.admin.findUnique({
        where: { userId: id },
      });
    }

    if (!isAdminExists) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Admin Not Found');
    }

    const result = await this.prisma.user.findUnique({
      where: { id: isAdminExists?.userId },
      include: { admin: true },
    });
    console.log(`see isadmin`, result);

    return result;
  }

  async update(id: string, data: UpdateAdminDto, avatar: string) {
    const { admin, ...user } = data;

    const isUserExists = await this.findOne(id);

    console.log(`is user exists`, isUserExists);

    const result = await this.prisma.$transaction(
      async (tx) => {
        if (user?.email) {
          const isEmailExists = await tx.user.findUnique({
            where: { email: user?.email, NOT: { id } },
          });

          if (isEmailExists) {
            throw new ApiError(
              HttpStatus.CONFLICT,
              `user email is already exists`,
            );
          }
        }

        if (user.contactNo) {
          const isContactNoExists = await tx.user.findUnique({
            where: { contactNo: user?.contactNo, NOT: { id } },
          });

          if (isContactNoExists) {
            throw new ApiError(
              HttpStatus.CONFLICT,
              `contact no is already exists`,
            );
          }
        }

        const adminUpdation = await this.prisma.admin.update({
          where: { id: isUserExists?.admin?.id },
          data: { ...(admin as any) },
        });

        if (!adminUpdation) {
          throw new ApiError(HttpStatus.NOT_FOUND, `admin updation failed`);
        }

        const userUpdation = await this.prisma.user.update({
          where: { id: isUserExists?.id },
          data: { ...user, ...(avatar ? { avatar } : {}) },
        });

        if (!userUpdation) {
          throw new ApiError(HttpStatus.NOT_FOUND, `user updated`);
        }
        return userUpdation;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );

    return await this.prisma.user.findUnique({
      where: { id: result?.id },
      include: { admin: true },
    });
  }

  async remove(id: string) {
    const isUserExists = await this.findOne(id);

    if (!isUserExists) {
      throw new ApiError(HttpStatus.NOT_FOUND, `user not found`);
    }

    await this.prisma.$transaction(
      async (tx) => {
        const adminDeletion = await this.prisma.admin.delete({
          where: { id: isUserExists?.admin.id },
        });

        const userDeletion = await this.prisma.user.delete({
          where: { id: isUserExists.id },
        });
        return userDeletion;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );

    return 'user deleted successfully';
  }
}
