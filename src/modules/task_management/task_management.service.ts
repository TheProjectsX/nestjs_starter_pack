import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTaskManagementDto } from './dto/create-task_management.dto';
import { UpdateTaskManagementDto } from './dto/update-task_management.dto';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';
import QueryBuilder from '@/utils/queryBuilder';
import { AplicationStatus } from '@prisma/client';

@Injectable()
export class TaskManagementService {

constructor(
  private readonly prisma: PrismaService,
  private readonly prismaHelper: PrismaHelperService
) {}
async create(createTaskManagementDto: CreateTaskManagementDto) {
  console.log(createTaskManagementDto, 'createTaskManagementDto');

  return await this.prisma.$transaction(async (tx) => {
    // 1. Find trader
    const trader = await tx.trader.findFirst({
      where: { id: createTaskManagementDto.traderId },
      include: {
        subscription: true,
      },
    });

    if (!trader) {
      throw new BadRequestException('Trader not found');
    }

    if (!trader.isVerified) {
      throw new BadRequestException('Trader is not verified');
    }

    if (!trader.subscription) {
      throw new BadRequestException('Trader has no active subscription');
    }

    // 2. Duplicate task check
    const duplicateTask = await tx.task.findFirst({
      where: {
        title: createTaskManagementDto.title,
        traderId: createTaskManagementDto.traderId,
      },
    });

    if (duplicateTask) {
      throw new BadRequestException('Task with the same title already exists');
    }

    // 3. Salary validation
    if (
      createTaskManagementDto.max_salary <
      createTaskManagementDto.min_salary
    ) {
      throw new BadRequestException(
        'Max salary should be greater than min salary',
      );
    }

    // 4. Skills limit validation
    if (createTaskManagementDto.require_skills.length > 5) {
      throw new BadRequestException(
        'You can add a maximum of 5 skills',
      );
    }

    // 5. Get subscription with plan
    const subscription = await tx.subscription.findFirst({
      where: {
        ownerId: trader.id,
      },
      include: {
        subscriptionPlan: true,
      },
    });

    if (!subscription) {
      throw new BadRequestException('Trader has no active subscription');
    }

    // const planFeatures = subscription.subscriptionPlan?.featuresList.map((f) =>
    //   f.toLowerCase(),
    // );

    // // 6. Limited / Unlimited tasks check
    // if (planFeatures.includes('limited_task')) {
    //   // Count active/in-progress tasks
    //   const activeTasksCount = await tx.task.count({
    //     where: {
    //       traderId: trader.id,
    //       status: {
    //         in: ['IN_PROGRESS', 'ORDER_ACTIVE'], // adjust if needed
    //       },
    //     },
    //   });

    //   if (
    //     activeTasksCount >=
    //     (subscription.subscriptionPlan.featuresList['limited_task'] ?? 0)
    //   ) {
    //     throw new BadRequestException(
    //       `You have reached your task creation limit of ${subscription.subscriptionPlan["limited_task"]}`,
    //     );
    //   }
    // }
    // If 'unlimited_task' or not present, no limit enforced

    if(subscription.subscriptionPlan.plan === "PRO_PLAN"){
      const activeTasksCount = await tx.task.count({
        where: {
          traderId: trader.id,
          status: {
            in: ['IN_PROGRESS', 'ORDER_ACTIVE'], // adjust if needed
          },
        },
      });
  
      if (
        activeTasksCount > 3
      ) {
        throw new BadRequestException(
          `You have reached your task creation limit of ${subscription.subscriptionPlan["limited_task"]}`,
        );
      }
    }

    console.log(trader.id, 'trader id in task management service');

    // 7. Create task
    const createdTask = await tx.task.create({
      data: {
        ...createTaskManagementDto,
        taskType: createTaskManagementDto.taskType ?? 'PAYMENT',
        status: createTaskManagementDto.status ?? 'IN_PROGRESS',
        isActive: createTaskManagementDto.isActive ?? true,
      },
    });

    return createdTask;
  });
}


 async findAll(
    query: Record<string, any>,
 ) {
  
    const queryBuilder = new QueryBuilder(query, this.prisma.task);
    const result = await queryBuilder
    .filter(["title","taskType","location","traderId","categoryid","subCategoryid"])
    .search(["isActive","require_skills", "status"])
    .nestedFilter([])
    .sort()
    .paginate() 
    .include({
      trader: true,
    })
    .fields()
    .filterByRange([
      {
        field: "max_salary",
        dataType: "number",
        maxQueryKey: query.min_salary,
        minQueryKey: query.max_salary,
      },
      {
        field: "min_salary",
        dataType: "number",
        maxQueryKey: query.min_salary,
        minQueryKey: query.max_salary,
      }
    ])
    .execute();
    const meta = await queryBuilder.countTotal();


    return { meta, data: result };
  }


async getTaskWithPrivetAll (
  query: Record<string, any>,
  user: any
) {

  const traderExiste = await this.prisma.trader.findFirst({where: {userId: user.id}});

  const queryBuilder = new QueryBuilder(query, this.prisma.task);
  const result = await queryBuilder
    .filter(["title","taskType","location","traderId","categoryid","subCategoryid"])
    .search(["isActive","require_skills", "status"])
    .nestedFilter([])
    .sort()
    .rawFilter({
      ...(user.role === "TRADER" && { traderId: traderExiste?.id }),
      ...(user.role === "ADMIN" && {}),
    })
    .paginate()
    .include({
      trader: true,
    })
    .fields()
    .filterByRange([
      {
        field: "max_salary",
        dataType: "number",
        maxQueryKey: query.min_salary,
        minQueryKey: query.max_salary,
      },
      {
        field: "min_salary",
        dataType: "number",
        maxQueryKey: query.min_salary,
        minQueryKey: query.max_salary,
      }
    ])
    .execute();
  const meta = await queryBuilder.countTotal();

  return { meta, data: result };
}

async findOne(id: string) {
  const task = await this.prisma.task.findUnique({ where: { id } });
  if (!task) {
      return "Task not found";
  }
  return task;
}

 async update(id: string, updateTaskManagementDto: UpdateTaskManagementDto) {

 const isFindingTask = await this.prisma.task.findUnique({
  where: { id },
});

if (!isFindingTask) {
  throw new BadRequestException('Task not found');
}
  
  
  return await this.prisma.task.update({where: {id}, data: updateTaskManagementDto});
}

 async remove(id: string) {

  this.prismaHelper.validateEntityExistence("task",id,"Task not found")

  const application = await this.prisma.task_Application.findFirst({
    where: {
      taskId: id,
      status: AplicationStatus.APPROVED
    },
  });

  if (application) {
    return "Cannot delete task with approved applications";
  }


  return await this.prisma.task.delete({where: {id}});

}
}
