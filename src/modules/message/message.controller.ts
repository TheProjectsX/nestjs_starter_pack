import { Controller, Get, Post, Delete, Patch, Body, Param, Request, UseInterceptors, UploadedFiles, HttpStatus, Query } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ChatService } from './message.service';
import { ResponseService } from '@/utils/response';
import { CustomFileFieldsInterceptor } from '@/helper/file_interceptor';
import { ParseFormDataInterceptor } from '@/helper/form_data_interceptor';

@Controller('messages')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}


@Get("user-list")
@Roles(Role.ADMIN, Role.TRADER) 
async getAllMessageUsers(
  @Query() query: Record<string, any>,
  @Request() req
) {
  const user = req?.user
  const messages = await this.chatService.getAllMessageUsers(user, query);
  return ResponseService.formatResponse({
    statusCode: HttpStatus.OK,
    message: 'Messages retrieved successfully',
    data: messages,
  });
}


@Get(':selectedUserId')
@Roles(Role.ADMIN, Role.TRADER) 
async getMessages(
  @Request() req,
  @Param('selectedUserId') selectedUserId: string
) {
  const currentUserId = req.user.id;

  console.log(currentUserId, selectedUserId, 'currentUserId and selectedUserId');

  const messages = await this.chatService.getMessagesBetweenUsers(
    currentUserId,
    selectedUserId
  );

  return ResponseService.formatResponse({
    statusCode: HttpStatus.OK,
    message: 'Messages retrieved successfully',
    data: messages,
  });
}

  @Post('files')
  @UseInterceptors(
    CustomFileFieldsInterceptor([{ name: 'files', maxCount: 10 }]),
    ParseFormDataInterceptor,
  )
  @Roles(Role.ADMIN, Role.TRADER)
  async uploadFile(@Request() req, @UploadedFiles() files: Record<string, Express.Multer.File[]>) {
    const userId = req.user.id;
    const fileUrls = files?.files?.map((file) => `${process.env.SERVER_END_POINT}/files/${file.filename}`);
    const result = await this.chatService.uploadFile(userId, fileUrls ? fileUrls : []);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.CREATED,
      message: 'File uploaded successfully',
      data: result,
    });
  }

  @Delete(':messageId')
  @Roles(Role.ADMIN, Role.TRADER)
  async deleteMessage(@Param('messageId') messageId: string, @Request() req) {
    const userId = req.user.id;
    await this.chatService.deleteMessage(messageId, userId);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Message deleted successfully',
    });
  }

  @Patch(':messageId')
  @Roles(Role.ADMIN, Role.TRADER)
  async updateMessage(@Param('messageId') messageId: string, @Body('text') text: string, @Request() req) {
    const userId = req.user.id;
    const updatedMessage = await this.chatService.updateMessage(messageId, userId, text);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Message updated successfully',
      data: updatedMessage,
    });
  }
}
