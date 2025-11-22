import { Module } from '@nestjs/common';
import { ChainlinkService } from './chainlink.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [ChainlinkService],
  exports: [ChainlinkService],
})
export class ChainlinkModule {}

