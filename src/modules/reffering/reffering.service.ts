import { Injectable } from '@nestjs/common';
import { CreateRefferingDto } from './dto/create-reffering.dto';
import { UpdateRefferingDto } from './dto/update-reffering.dto';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';

@Injectable()
export class RefferingService {

  constructor(
    private prisma: PrismaService,
    private readonly prismaHelper: PrismaHelperService
  ) {}

 async create(createRefferingDto: CreateRefferingDto, user: any) {

  const isExiteTrader = await this.prisma.trader.findUnique({
    where: {
      userId: user.id
    }
  });

  this.prismaHelper.validateEntityExistence("trader", createRefferingDto.refferingId, "Reffering not found");
  if(createRefferingDto.refferingId === isExiteTrader.id) return "You can not refer yourself";

  const isAlreadyReffered = await this.prisma.traderRefferIng.findFirst({
    where: {
      traderId: isExiteTrader.id,
      refferingId: createRefferingDto.refferingId
    }
  });

  if(isAlreadyReffered) return "You have already referred this user";

  return await this.prisma.traderRefferIng.create({
    data: {
      ...createRefferingDto,
      traderId: isExiteTrader.id,
      referringCount: 1
    }
  });
}

 async findAll(
   query: Record<string, any>,
   user: any
 ) {
  
  console.log(user,'chekcing user in reffering service');

  const isExiteTrader = await this.prisma.trader.findUnique({
    where: {
      userId: user.id
    }
  });

  if(!isExiteTrader) return "User not found";

  return await this.prisma.traderRefferIng.findMany({
    where: {traderId: isExiteTrader.id}
  });

}

 async findOne(id: string) {
  this.prismaHelper.validateEntityExistence("traderRefferIng", id, "Reffering not found");
  return await this.prisma.traderRefferIng.findUnique({where: {id}});
}

 async update(id: string, updateRefferingDto: UpdateRefferingDto) {

  this.prismaHelper.validateEntityExistence("traderRefferIng", id, "Reffering not found");
  return await this.prisma.traderRefferIng.update({
    where: {id}, 
    data:{
      ...updateRefferingDto
    } 
  });
}

 async remove(id: string) {
  this.prismaHelper.validateEntityExistence("traderRefferIng", id, "Reffering not found");
  return await this.prisma.traderRefferIng.delete({
    where: {id}
  });
}
}
