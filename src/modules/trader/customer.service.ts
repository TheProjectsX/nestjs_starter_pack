import { PrismaService } from '@/helper/prisma.service';
import { IGenericResponse } from '@/interface/common';
import { ApiError } from '@/utils/api_error';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Trader, Role, SubscriptionStatus } from '@prisma/client';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import QueryBuilder from '@/utils/queryBuilder';
// import { UpdateCustomerDto } from './dto/update-Customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

async findAll(
  query: Record<string, any>,
): Promise<IGenericResponse<Trader[]>> {
  const populateFields = query.populate
    ? query.populate
        .split(',')
        .reduce((acc: Record<string, boolean>, field) => {
          acc[field] = true;
          return acc;
        }, {})
    : {};

  // Use Trader model directly
  const queryBuilder = new QueryBuilder(query, this.prisma.trader);

  const result = await queryBuilder
   .filter([])
    .search(["nationality","fastName", "lastName"])
    .nestedFilter([])
    .sort()
    .paginate() 
    .include({
      user: true,
    })
    .fields()
    .filterByRange([
      {
        field: "mininumHoulyRate",
        dataType: "number",
        maxQueryKey: query.mininumHoulyRate,
        minQueryKey: query.mininumHoulyRate,
      }
    ])
    .execute();
    const meta = await queryBuilder.countTotal();

  // const sortedResult = result.sort((a, b) => {
    const getRank = (trader: any) => {
      const sub = trader.subscription?.[0];
      if (
        sub &&
        sub.subscriptionStatus === SubscriptionStatus.ACTIVE
      ) {
        const plan = sub.subscriptionPlan?.plan;
        if (plan === 'ELITE_PLAN') return 1;
        if (plan === 'PRO_PLAN') return 2;
      }
      return 3;
    };

   const sortedResult = result.sort((a : any, b : any) => {
      const rankA = getRank(a);
      const rankB = getRank(b);
      return rankA - rankB;
    });

  return { meta, data: sortedResult };

}


  async findOne(id: string) {
    let isCustomerExists = await this.prisma.trader
      .findUnique({
        where: { id },
      })
      .catch(() => null);

    if (!isCustomerExists) {
      isCustomerExists = await this.prisma.trader.findUnique({
        where: { userId: id },
      });
    }

    if (!isCustomerExists) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Customer Not Found');
    }

    return await this.prisma.user.findUnique({
      where: { id: isCustomerExists?.userId },
      include: { trader: true },
    });
  }

  async update(id: string, data: UpdateCustomerDto, avatar: string) {
    const { trader, ...user } = data;

    const isUserExists = await this.findOne(id);

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

        const CustomerUpdation = await this.prisma.trader.update({
          where: { id: isUserExists?.trader?.id },
          data: { ...(trader as any) },
        });

        if (!CustomerUpdation) {
          throw new ApiError(HttpStatus.NOT_FOUND, `Customer updation failed`);
        }

        console.log(`see customer`, trader);

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
      include: { trader: true },
    });
  }

  async remove(id: string) {
    const isUserExists = await this.findOne(id);

    if (!isUserExists) {
      throw new ApiError(HttpStatus.NOT_FOUND, `user not found`);
    }

    await this.prisma.$transaction(
      async (tx) => {
        const CustomerDeletion = await tx.trader.delete({
          where: { id: isUserExists?.trader.id },
        });

        const userDeletion = await tx.user.delete({
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





// {

//   "username": "foridul.islam",
//   "email": "foridul@example.com",
//   "description": "Enthusiastic property investor and digital platform user.",
//   "bankId": "BD220001123456789",
//   "contactNo": "+8801712345678",
//   "password": "$2b$10$123456789012345678901uO8x1fkeDsfjK1FeCRZQ1DZO2", // bcrypt hash
//   "lang": "ENG",
//    "customer":{
//     "fullName":"foridul"
//    }
// }
