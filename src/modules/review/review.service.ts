import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaHelperService } from '@/utils/is_existance';
import { PrismaService } from '@/helper/prisma.service';
import QueryBuilder from '@/utils/queryBuilder';

@Injectable()
export class ReviewService {
 
  constructor (
    private readonly prisma: PrismaService,
    private readonly prismaHelper: PrismaHelperService,

  ) {}

  async create(createReviewDto: CreateReviewDto) {
      this.prismaHelper.validateEntityExistence("task", createReviewDto.taskId, "Task not found");
      this.prismaHelper.validateEntityExistence("trader", createReviewDto.reviewReceiverId, "User not found");
      this.prismaHelper.validateEntityExistence("trader", createReviewDto.reviewProviderId, "User not found");

    return await this.prisma.review.create({data: createReviewDto}as any);

}

async  findAll(
  query: Record<string, any>,
  user : any
) {

  const traderid =  await this.prisma.trader.findFirst({where: {userId: user.id}});

  const queryBuilder = new QueryBuilder(query, this.prisma.review);

  const result = await queryBuilder
    .filter([]) 
    .search([])
    .rawFilter({reviewProviderId: traderid?.id})
    .nestedFilter([])
    .sort()
    .paginate()
    .include({})
    .fields()
    .filterByRange([])
    .execute();

    
  const meta = await queryBuilder.countTotal();
  return { meta, data: result };

}

async  findOne(id: string) {

  this.prismaHelper.validateEntityExistence("review",id,
    "Review not found"
  )

  return await this.prisma.review.findUnique({where: {id}});

}

 async update(id: string, updateReviewDto: UpdateReviewDto) {

  this.prismaHelper.validateEntityExistence("review",id,
    "Review not found"
  )
  
  return await this.prisma.review.update({where: {id}, data: updateReviewDto});
  
  }

 async remove(id:string) {

  this.prismaHelper.validateEntityExistence("review",id,
    "Review not found"
  )
  
  const isDeleted = await this.prisma.review.delete({where: {id}});
  
  if (isDeleted) {
    return "Review deleted successfully";

  } else {
    return "Review not deleted";
  }

  }
}
