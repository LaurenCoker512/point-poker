import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardModule } from './board/board.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventsGateway } from './events/events.gateway';

@Module({
  imports: [ConfigModule.forRoot(), BoardModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
