import { Module } from '@nestjs/common';
import { FilecoinService } from './filecoin.service';
import { FilecoinController } from './filecoin.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [FilecoinController],
  providers: [FilecoinService],
  exports: [FilecoinService],
})
export class FilecoinModule {}

