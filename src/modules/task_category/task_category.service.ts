import { Injectable } from '@nestjs/common';
import { CreateTaskCategoryDto } from './dto/create-task_category.dto';
import { UpdateTaskCategoryDto } from './dto/update-task_category.dto';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';
import QueryBuilder from '@/utils/queryBuilder';

@Injectable()
export class TaskCategoryService {

  constructor(
    private prisma: PrismaService,
    private prismaHelper: PrismaHelperService
  ) {}

 async create(createTaskCategoryDto: CreateTaskCategoryDto) {

     return await this.prisma.category.create({
      data: {
        ...createTaskCategoryDto,
        categoryId: createTaskCategoryDto.categoryId,
      }as any
    });
}

async createSubCategory (createTaskCategoryDto: CreateTaskCategoryDto) {

    return await this.prisma.subCategory.create({
     data: {
       ...createTaskCategoryDto,
     }as any
   });
}

async findAllCategory(query: Record<string, any>) {
    const queryBuilder = new QueryBuilder(query, this.prisma.category);
    const result = await queryBuilder
      .filter([])
      .search([])
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

 async findAll(
  query: Record<string, any>,
 ) {

  const queryBuilder = new QueryBuilder(query, this.prisma.category);
    const result = await queryBuilder

      .filter()
      .search([])
      .nestedFilter([])
      .sort()
      .paginate()
      .include({
        SubCategory: true
      })
      .fields()
      .filterByRange([])
      .execute();

    const meta = await queryBuilder.countTotal();

    return { meta, data: result };
}

 async findAllSubCategory(
  query: Record<string, any>,
 ) {

  const queryBuilder = new QueryBuilder(query, this.prisma.subCategory);
    const result = await queryBuilder

      .filter()
      .search([])
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
  this.prismaHelper.validateEntityExistence("category",id,
    "Category not found"
  )

  return await this.prisma.category.findUnique({where: {id}});

}

async findOneBySubCategory(id: string) {
  this.prismaHelper.validateEntityExistence("subCategory",id,
    "SubCategory not found"
  )

  return await this.prisma.subCategory.findUnique({where: {id}});
} 

 async update(id: string, updateTaskCategoryDto: UpdateTaskCategoryDto) {
  this.prismaHelper.validateEntityExistence("category",id,
    "Category not found"
  )
  return await this.prisma.category.update({where: {id}, data: updateTaskCategoryDto});
}

async updateSubCategory(id: string, updateTaskCategoryDto: UpdateTaskCategoryDto) {
  this.prismaHelper.validateEntityExistence("subCategory",id,
    "SubCategory not found"
  )
  return await this.prisma.subCategory.update({where: {id}, data: updateTaskCategoryDto});
}

 async remove(id: string) {
    this.prismaHelper.validateEntityExistence("category",id,
      "Category not found"
    )
    return  await this.prisma.category.delete({where: {id}});
}

async removeSubCategory(id: string) {
  this.prismaHelper.validateEntityExistence("subCategory",id,
    "SubCategory not found"
  )
  return  await this.prisma.subCategory.delete({where: {id}});
}
}
