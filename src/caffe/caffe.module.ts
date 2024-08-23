import { Module } from '@nestjs/common';
import { CaffeService } from './caffe.service';
import { CaffeController } from './caffe.controller';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Module({
  controllers: [CaffeController],
  providers: [
    CaffeService,
    PrismaService,
    JwtService,
    { provide: APP_GUARD, useClass: AuthGuard },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class CaffeModule {}
