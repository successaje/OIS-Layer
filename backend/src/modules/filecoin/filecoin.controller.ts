import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { FilecoinService } from './filecoin.service';

@Controller('api/filecoin')
export class FilecoinController {
  constructor(private readonly filecoinService: FilecoinService) {}

  /**
   * Pin JSON data to Filecoin
   */
  @Post('pin/json')
  async pinJson(@Body() data: any) {
    try {
      const cid = await this.filecoinService.pinJson(data);
      return { cid, success: true };
    } catch (error) {
      throw new BadRequestException(`Failed to pin JSON: ${error.message}`);
    }
  }

  /**
   * Pin file to Filecoin
   */
  @Post('pin/file')
  @UseInterceptors(FileInterceptor('file'))
  async pinFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const cid = await this.filecoinService.pinFile(
        Buffer.from(file.buffer),
        file.originalname,
      );
      return { cid, success: true, filename: file.originalname };
    } catch (error) {
      throw new BadRequestException(`Failed to pin file: ${error.message}`);
    }
  }

  /**
   * Retrieve data from Filecoin by CID
   */
  @Get('cat/:cid')
  async getByCid(@Param('cid') cid: string) {
    try {
      const data = await this.filecoinService.getByCid(cid);
      return { cid, data, success: true };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve CID: ${error.message}`);
    }
  }

  /**
   * Verify CID exists on Filecoin
   */
  @Get('verify/:cid')
  async verifyCid(@Param('cid') cid: string) {
    try {
      const exists = await this.filecoinService.verifyCid(cid);
      return { cid, exists, success: true };
    } catch (error) {
      return { cid, exists: false, success: false };
    }
  }
}

