import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/helper/prisma.service';
import { FileType } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

async getMessagesBetweenUsers(userAId: string, userBId: string) {
  return this.prisma.chat.findMany({
    where: {
      OR: [
        { senderId: userAId, receiverId: userBId },
        { senderId: userBId, receiverId: userAId }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
}


async getAllMessageUsers(user: any, query: { searchTerm?: string }) {
  const search = query.searchTerm?.trim();

  // 1️⃣ Get all chats involving this user
  const chats = await this.prisma.chat.findMany({
    where: {
      OR: [
        { senderId: user.id },
        { receiverId: user.id },
      ],
    },
    select: {
      sender: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          description: true,
        },
      },
      reciver: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          description: true,
        },
      },
    },
  });

  // 2️⃣ Extract all other users (exclude current user)
  const usersMap = new Map<string, any>();

  chats.forEach(chat => {
    if (chat.sender.id !== user.id) usersMap.set(chat.sender.id, chat.sender);
    if (chat.reciver.id !== user.id) usersMap.set(chat.reciver.id, chat.reciver);
  });

  // 3️⃣ Convert map to array
  let users = Array.from(usersMap.values());

  // 4️⃣ Apply search filter if provided
  if (search) {
    const lowerSearch = search.toLowerCase();
    users = users.filter(u => 
      u.username?.toLowerCase().includes(lowerSearch) ||
      u.email?.toLowerCase().includes(lowerSearch)
    );
  }

  return users;
}


  async uploadFile(userId: string, files: string[]) {
    return this.prisma.uploadedFile.create({
      data: {
        urls: files, 
        uploadedBy: userId
         }
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.chat.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) throw new ForbiddenException('You cannot delete this message');

    await this.prisma.chat.delete({
      where: { id: messageId }
    });
  }

  async updateMessage(messageId: string, userId: string, text: string) {
    const message = await this.prisma.chat.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) throw new ForbiddenException('You cannot edit this message');

    return this.prisma.chat.update({
      where: { id: messageId },
      data: { message: text },
    });
  }

  private getFileType(filePath: string): FileType {
    if (filePath.match(/\.(jpg|jpeg|png|gif)$/i)) return FileType.IMAGE;
    if (filePath.match(/\.(mp4|mov|avi)$/i)) return FileType.VIDEO;
    if (filePath.match(/\.(mp3|wav)$/i)) return FileType.AUDIO;
    return FileType.FILE;
  }
}
