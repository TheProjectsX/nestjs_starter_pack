import { Injectable } from '@nestjs/common';
import { CreateBootsMangementDto } from './dto/create-boots_mangement.dto';
import { UpdateBootsMangementDto } from './dto/update-boots_mangement.dto';

@Injectable()
export class BootsMangementService {
  create(createBootsMangementDto: CreateBootsMangementDto) {
    return 'This action adds a new bootsMangement';
  }

  findAll() {
    return `This action returns all bootsMangement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bootsMangement`;
  }

  update(id: number, updateBootsMangementDto: UpdateBootsMangementDto) {
    return `This action updates a #${id} bootsMangement`;
  }

  remove(id: number) {
    return `This action removes a #${id} bootsMangement`;
  }
}
