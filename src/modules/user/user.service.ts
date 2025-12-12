import { PrismaService } from '@/helper/prisma.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role, User } from '@prisma/client';
import { ApiError } from 'src/utils/api_error';
import { BcryptService } from 'src/utils/bcrypt.service';
import QueryBuilderIsrafil from '@/utils/queryBuilder';

import {
  userFilterFields,
  userInclude,
  userNestedFilters,
  userRangeFilter,
  userSearchFields,
} from './user.constant';

import { CreateUserAdminDto } from './dto/create-admin.dto';
import QueryBuilder from '@/utils/queryBuilder';


@Injectable()
export class UserService {
  
  constructor(
    private prisma: PrismaService,
    private bcryptService: BcryptService,
    private readonly configService: ConfigService,
  ) {}


  async createAdmin(data: CreateUserAdminDto): Promise<User | null> {
    const { admin: adminData, ...userData } = data;

    const result = await this.prisma.$transaction(
      async (tx) => {
        userData.role = Role.ADMIN;

        if (!userData.password) {
          userData.password = this.configService.get<string>(
            'DEFAULT_ADMIN_PASSWORD',
          );
        }

        userData.password = await this.bcryptService.hash(userData.password);

        const isEmailExists = await tx.user.findUnique({
          where: { email: userData?.email },
        });

        if (isEmailExists) {
          throw new ApiError(
            HttpStatus.CONFLICT,
            `user email is already exists`,
          );
        }

        const isContactNoExists = await tx.user.findUnique({
          where: { contactNo: userData?.contactNo },
        });

        if (isContactNoExists) {
          throw new ApiError(
            HttpStatus.CONFLICT,
            `contact no is already exists`,
          );
        }

        const userCreation = await tx.user.create({
          data: { ...userData, role: Role.ADMIN },
        });

        const adminCreation = await tx.admin.create({
          data: {
            ...adminData,
            userId: userCreation?.id,
          } as any,
        });

        if (!userCreation || !adminCreation) {
          throw new ApiError(
            HttpStatus.NOT_FOUND,
            'Failed to create admin and user',
          );
        }

        return userCreation;
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

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data
    });
  }

  async getMany(query: Record<string, string>) {
    const queryBuilder = new QueryBuilder(query, this.prisma.user);
    const result = await queryBuilder

      .filter(userFilterFields)
      .search(userSearchFields)
      .nestedFilter(userNestedFilters)
      .sort()
      .paginate()
      .include(userInclude)
      .fields()
      .filterByRange(userRangeFilter)
      .execute();

    const meta = await queryBuilder.countTotal();

    return { meta, data: result };
  }

  async getOne(data: { email: string }): Promise<User | any | null> {
    const result = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.email }],
      },
      include: {
        admin: true,
        trader: true,
      },
    });

    return result;
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async updatePassword({ id, password }: { id: string; password: string }) {
    return this.prisma.user.update({ where: { id }, data: { password } });
  }
}
