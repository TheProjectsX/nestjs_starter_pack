import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Query, Req } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ResponseService } from '@/utils/response';
import QueryBuilder from '@/utils/queryBuilder';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
 async create(@Body() createReviewDto: CreateReviewDto) {
    const result = await this.reviewService.create(createReviewDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Review Created Successfully',
      data: result
    })
  }

  @Get()
 async findAll(
   @Query() query: Record<string, any>,
   @Req() req: any
 ) {
    const user = req.user;
    const result = await this.reviewService.findAll(query, user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Review Found Successfully',
      data: result
    });
  }

  @Get(':id')
 async findOne(@Param('id') id: string) {
    const result = await this.reviewService.findOne(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Review Found Successfully',
      data: result
    });

  }

  @Patch(':id')
 async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    const result = await this.reviewService.update(id, updateReviewDto);

    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Review Updated Successfully',
      data: result
    });

  }

  @Delete(':id')
 async remove(@Param('id') id: string) {
    const result = await this.reviewService.remove(id);

    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Review Deleted Successfully',
      data: result
    });

  }
}
