import { BadRequestException, Injectable, NotFoundException, Query } from '@nestjs/common';
import { CreateTaskApplicationDto } from './dto/create-task_application.dto';
import { UpdateTaskApplicationDto } from './dto/update-task_application.dto';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';
import QueryBuilder from '@/utils/queryBuilder';
import { AplicationStatus, Role, Task, TaskStatus } from '@prisma/client';
import { MarketplacePaymentService } from '@/payment/Stripe/marketplace.payment';

@Injectable()
export class TaskApplicationService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaHelper: PrismaHelperService,
    private readonly marketplaceService: MarketplacePaymentService
    ) {}
  async create(createTaskApplicationDto: CreateTaskApplicationDto, user:any) {

    const findingUser = await this.prisma.trader.findFirst({
      where: {
        userId: user?.id
      }
    });

    if(!findingUser) {
      throw new BadRequestException("User not found");
    }

    if(findingUser.isVerified === false){
      throw new BadRequestException("User is not verified");
    }

    const isOwner = await this.prisma.task.findFirst({
      where: {
        id: createTaskApplicationDto.taskId,
        ...(findingUser.id && {traderId: findingUser.id})
      }
    });


    const isExiteTask = await this.prisma.task.findUnique({
      where:{
        id: createTaskApplicationDto.taskId
      }
    })

    if(!isExiteTask) {
      throw new BadRequestException("Task not found");
    }

    if(isOwner){
      throw new BadRequestException("You cannot apply for your own task");
    }


  const subscription = await this.prisma.subscription.findFirst({
    where: {
      ownerId: findingUser.id
    },
    include:{
      subscriptionPlan: true
    }
  });


  if(!subscription) {
    throw new BadRequestException("Subscription not found");
  }

  if(subscription.subscriptionStatus !== "ACTIVE") {
    throw new BadRequestException("Subscription is not active");
  }

  if(subscription.subscriptionPlan.plan === "ELITE_PLAN"){
    const isExpireLimted = await this.prisma.task_Application.count({
      where:{
        offerId: findingUser.id,
        status: {
          in:[AplicationStatus.IN_PROGRESS, AplicationStatus.APPROVED]
        }
      }
    })

    if(isExpireLimted > 3) {
      throw new BadRequestException("User has reached the maximum number of applications");
    } 
  }

  const isAlreadyApplied = await this.prisma.task_Application.findFirst({
    where: {
      taskId: createTaskApplicationDto?.taskId,
      offerId: findingUser?.id
    }
  });

  if(isAlreadyApplied) return "You have already applied for this task";
  
    const reponse = await  this.prisma.task_Application.create({
      data:{
        ...createTaskApplicationDto,
        offerId: findingUser.id
      } as  any
    });
    return reponse
  }

 async OfferAll(
  query: Record<string, any>,
  user: any
 ) {

  const isFinginTrader = await this.prisma.trader.findFirst({
    where: {
      userId: user.id
    }
  });


  if(!isFinginTrader) return "User not found";

  const queryBuilder = new QueryBuilder(query, this.prisma.task);

  const result = await queryBuilder
    .filter(["status"])
    .search([])
    .nestedFilter([])
    .sort()
    .paginate()
    .rawFilter({ 
      traderId: isFinginTrader.id,
      status: TaskStatus.IN_PROGRESS
     })
    .include({
        task_Application: {
      include: {
        offerByTrader: true  
      }
    }
    })
    .fields()
    .filterByRange([])
    .execute();

  const meta = await queryBuilder.countTotal();

  return { meta, data: result };
}

async RequestAll (
  query: Record<string, any>,
  user: any
){

  const isFinginTrader = await this.prisma.trader.findFirst({
    where: {
      userId: user.id
    }
  });

  if(!isFinginTrader) return "User not found";

  const queryBuilder = new QueryBuilder(query, this.prisma.task_Application);
  const result = await queryBuilder
    .filter()
    .search([])
    .nestedFilter([])
    .sort()
    .rawFilter({
      offerId: isFinginTrader.id,
       status: {
      in: [AplicationStatus.IN_PROGRESS, AplicationStatus.APPROVED],
    },
    })
    .paginate()
    .include({
      offerByTrader: true,
      task: true
    })
    .fields()
    .filterByRange([])
    .execute();

  const meta = await queryBuilder.countTotal();

  return { meta, data: result };
}

async HistoryAllByTrader (query: Record<string, any>, user: any){ 

  const isFinginTrader = await this.prisma.trader.findFirst({
    where: {
      userId: user.id
    }
  });

  if(!isFinginTrader) {
    throw new BadRequestException("User not found");
  }


  const queryBuilder = new QueryBuilder(query, this.prisma.task);
  const result = await queryBuilder
    .filter(["status", "traderId", "offerId", "taskId", "taskType", "categoryid", "subCategoryid"])
    .search([])
    .nestedFilter([])
    .sort()
    .rawFilter({
    status: {
      in: [TaskStatus.CANCELLED, TaskStatus.COMPLETED],
    },
    traderId: isFinginTrader.id
    })
    .paginate()
    .include({})
    .fields()
    .filterByRange([])
    .execute();

  const meta = await queryBuilder.countTotal();

  return { meta, data: result };
}


async findingDeliveryTaskAll(
  query: Record<string, any>,
  user: any
){

  const isFindingTrader = await this.prisma.trader.findUnique({
    where:{
      userId: user?.id
    }
  });

  if(!isFindingTrader) throw new NotFoundException("User Not Found")

  const queryBuilder = new QueryBuilder(query, this.prisma.task);
  const result = await queryBuilder
    .filter(["status", "traderId", "offerId", "taskId", "taskType", "categoryid", "subCategoryid"])
    .search([])
    .nestedFilter([])
    .sort()
    .rawFilter({
    status: TaskStatus.DELIVERED,
     traderId: isFindingTrader.id
    })
    .paginate()
    .include({
      task_Application: {
        include: {
          offerByTrader: true
        }
      }
    })
    .fields()
    .filterByRange([])
    .execute();

  const meta = await queryBuilder.countTotal();

  return { meta, data: result };
}

 async findOneOffer(id: string,user: any) {

  if(!id) throw new BadRequestException("Task Id not provided in request");
  if(!user) throw new BadRequestException("User not found");

  const findingTaskApplication = await this.prisma.task_Application.findFirst({
    where: {
      id
    },
    include: {
      task: true
    }
  });
  
  if(!findingTaskApplication) throw new BadRequestException("Task Application not found");

  const result = await this.prisma.task.findFirst({
    where: {
      id: findingTaskApplication?.taskId
    },
    include: {
      task_Application: {
        include: {
         task:{
           include: {
             review: true
              }
           }
        }
      }
    }
  });
  return result
}

 async findOneRequest(id: string) {
    return await this.prisma.task_Application.findFirst({
      where: {
        id
      },
      include: {
        task: {
          include:{
            review: true
          }
        }
      }
    })

}


async updateOffer(id: string, updateTaskApplicationDto: UpdateTaskApplicationDto) {
  if(!id) throw new BadRequestException("Task Id not provided in request");
  
  const findingTaskApplication = await this.prisma.task_Application.findFirst({
    where: {
      id
    },
    include: {
      task: true
    }
  });

  const isExtingTrader = await this.prisma.trader.findFirst({
    where: {
      id: updateTaskApplicationDto.offerId
    }
  });

  if(!isExtingTrader) throw new BadRequestException("User not found");

  if(findingTaskApplication.status === AplicationStatus.IN_PROGRESS){
        if(!findingTaskApplication) return "Task Application not found";
        if(findingTaskApplication.task.status !== TaskStatus.IN_PROGRESS) return "Task is status not in progress";
        const reponse = await this.marketplaceService.createPaymentWithSession({
          taskId: findingTaskApplication.taskId,
          buyerId: findingTaskApplication.offerId, 
          task_applicationId: findingTaskApplication.id,
          amount: findingTaskApplication.task.max_salary ?? findingTaskApplication.task.min_salary,
          paymentType: "OnTimePayment_TaskApplication_Offer"
        });

      return reponse
  }
}

async approveDelivery (taskId: string){

  const isFindingTaskApplayed = await this.prisma.task_Application.findFirst({
    where:{
      id: taskId
    },
    include:{
      task: true
    }
  });

  if(!isFindingTaskApplayed) throw new BadRequestException("Task not found");
  if(isFindingTaskApplayed.status !== AplicationStatus.APPROVED) throw new BadRequestException("Task Status is not approved");
  if(isFindingTaskApplayed.task.status !== TaskStatus.DELIVERED) throw new BadRequestException("Task is not order active");

  const isExtingTrader = await this.prisma.trader.findFirst({
    where: {
      id: isFindingTaskApplayed.offerId
    }
  });
    
  if(!isExtingTrader) throw new BadRequestException("Trader not found");
  

   const response = await this.marketplaceService.transferMoney({
     traderAccountId:  isExtingTrader.stripeAccountId,
     taskId: isFindingTaskApplayed.task.id,
     amount: isFindingTaskApplayed.task.max_salary || 100 ,
     paymentType: "OnTimePayment_TaskApplication_Offer_paymentTransfer"
    });

    return response;
}

async  updateRequest(id: string, updateTaskApplicationDto: UpdateTaskApplicationDto) {

if(!id) return "Task Application not found";

const finding = await this.prisma.task_Application.findFirst({
    where: {
      id
    },
    include:{
      task: true
    }
});

if(!finding) return "Task Application not found";
if(finding.status !== AplicationStatus.APPROVED) return "Application Status is not Approved";
if(finding.task.status !== TaskStatus.ORDER_ACTIVE) return "Task is not order active";

return await this.prisma.task.update({
    where:{
      id: finding.taskId
    },
    data:{
      status: TaskStatus.DELIVERED,
      ...updateTaskApplicationDto

    }
  })
}

  remove(id: string) {
    return `This action removes a #${id} taskApplication`;
  }
}
