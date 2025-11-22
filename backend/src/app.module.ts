import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntentsModule } from './modules/intents/intents.module';
import { AgentsModule } from './modules/agents/agents.module';
import { FilecoinModule } from './modules/filecoin/filecoin.module';
import { LlamaModule } from './modules/llama/llama.module';
import { ChainlinkModule } from './modules/chainlink/chainlink.module';
import { LayerzeroModule } from './modules/layerzero/layerzero.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    IntentsModule,
    AgentsModule,
    FilecoinModule,
    LlamaModule,
    ChainlinkModule,
    LayerzeroModule,
  ],
})
export class AppModule {}

