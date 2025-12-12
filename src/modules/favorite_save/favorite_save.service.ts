import { Injectable } from '@nestjs/common';
import { CreateFavoriteSaveDto } from './dto/create-favorite_save.dto';
import { UpdateFavoriteSaveDto } from './dto/update-favorite_save.dto';
import QueryBuilder from '@/utils/queryBuilder';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';

@Injectable()
export class FavoriteSaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaHelper: PrismaHelperService
      
  ){}
async create(createFavoriteSaveDto: CreateFavoriteSaveDto) {

  await this.prismaHelper.validateEntityExistence("trader", createFavoriteSaveDto.traderOwnerId, "Trader not found");
  

  if (createFavoriteSaveDto?.favoriteByTraderId) {
    await this.prismaHelper.validateEntityExistence("trader", createFavoriteSaveDto.favoriteByTraderId, "Trader not found");
  }
  

  if (createFavoriteSaveDto?.taskId) {
    await this.prismaHelper.validateEntityExistence("task", createFavoriteSaveDto.taskId, "Task not found");
  }

  // Create the favourite record
  return await this.prisma.favourite.create({
    data: createFavoriteSaveDto as any
  });
}


 async findAll(
    query: Record<string, any>,
    user: any
 ) {

  const trader = await this.prisma.trader.findFirst({where: {userId: user.id}});

  const queryBuilder =  new QueryBuilder(query,this.prisma.favourite);
  
      const result = await queryBuilder
        .filter()
        .search([])
        .nestedFilter([])
        .sort()
        .rawFilter({
          traderOwnerId: trader?.id
        })
        .paginate()
        .include({
            favoriteByTrader: true, 
            task: true,         
        })
        .fields()
        .filterByRange([])
        .execute();
  
        const meta = await queryBuilder.countTotal();
  
        return { meta, data: result };

}

 async findOne(id: string) {
      this.prismaHelper.validateEntityExistence("favourite",id,
        "favorite not found"
      )
      return await this.prisma.favourite.findUnique({
        where: {id},
        include:{
          favoriteByTrader: true,
          task: true
        }
      });
}

 async update(id: string, updateFavoriteSaveDto: UpdateFavoriteSaveDto) {

  this.prismaHelper.validateEntityExistence("favourite",id,
    "favorite not found"
  )
  return await this.prisma.favourite.update({where: {id}, data: updateFavoriteSaveDto}as any);
}

 async remove(id: string) {

  this.prismaHelper.validateEntityExistence("favourite",id,
    "favorite not found"
  )
  return await this.prisma.favourite.delete({where: {id}});
}
}
