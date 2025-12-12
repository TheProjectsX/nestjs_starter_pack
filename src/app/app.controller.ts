import { IsPublic } from '@/modules/auth/auth.decorator';
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,

} from '@nestjs/common';
import * as fs from 'fs'
import * as path from 'path';
import * as mime from 'mime-types';
import { Response } from 'express';


@Controller()
export class AppController {
@IsPublic()
@Get('files/:filename')
async streamFile(@Param('filename') filename: string, @Res() res: Response) {

  console.log(filename,'checking file name here');

  if (filename.includes('..')) {
    throw new NotFoundException('Invalid filename');
  }

  const filePath = path.join(process.cwd(), 'tmp', filename);
  console.log(filePath,'checking file path here');

  let stat;
  try {
    stat = await fs.promises.stat(filePath);
  } catch {
    throw new NotFoundException('File not found');
  }

  const mimeType = mime.lookup(filePath) || 'application/octet-stream';

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.on('error', () => res.status(500).send('Error reading file'));
  fileStream.pipe(res);
}

}
