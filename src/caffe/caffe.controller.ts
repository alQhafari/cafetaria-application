import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseInterceptors,
  Query,
  ParseIntPipe,
  Put,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { CaffeService } from './caffe.service';
import { CreateCaffeDto } from './dto/create-caffe.dto';
import { UpdateCaffeDto } from './dto/update-caffe.dto';
import { Caffe, CaffeOwner, Role } from '@prisma/client';
import { getAllInterceptor } from 'src/common/interceptors/getAll.interceptor';
import { Public } from 'src/auth/common/public.decorator';
import { Roles } from 'src/auth/common/roles.decorator';

@Controller('caffes')
export class CaffeController {
  constructor(private readonly caffeService: CaffeService) {}

  @Post()
  @Roles(Role.OWNER, Role.SUPERADMIN)
  async create(
    @Body(ValidationPipe) createCaffeDto: CreateCaffeDto,
    @Request() req: any,
  ): Promise<Caffe> {
    return await this.caffeService.create(createCaffeDto, req);
  }

  @Get()
  @UseInterceptors(getAllInterceptor)
  async findAll(@Query() query: string, @Request() req: any) {
    if (req.user.role === Role.OWNER) {
      return this.caffeService.findByOwner(query, req);
    } else if (req.user.role === Role.MANAGER) {
      throw new UnauthorizedException();
    }
    return this.caffeService.findAll(query);
  }

  @Get(':id/menus')
  async findMenuByCaffe(@Param('id', ParseIntPipe) id: number) {
    return this.caffeService.findMenuByCaffe(id);
  }

  @Roles(Role.OWNER, Role.SUPERADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.caffeService.findOne(id, req);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.SUPERADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCaffeDto: UpdateCaffeDto,
    @Request() req: any,
  ) {
    return this.caffeService.update(id, updateCaffeDto, req);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.SUPERADMIN)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.caffeService.remove(id, req);
  }

  @Post('owner')
  @Roles(Role.SUPERADMIN)
  async createCaffeOwner(@Body() body: { ownerId: number; caffeId: number }) {
    return this.caffeService.addCaffeOwner(body.ownerId, body.caffeId);
  }

  @Post('manager')
  @Roles(Role.OWNER, Role.SUPERADMIN)
  async createCaffeManager(
    @Body() body: { managerId: number; caffeId: number },
  ) {
    return this.caffeService.addCaffeManager(body.managerId, body.caffeId);
  }

  @Put('owner')
  @Roles(Role.SUPERADMIN)
  async updateCaffeOwner(
    @Body() body: { oldOwnerId: number; newOwnerId: number; caffeId: number },
  ) {
    return this.caffeService.updateCaffeOwner(
      body.oldOwnerId,
      body.caffeId,
      body.newOwnerId,
    );
  }

  @Put('manager')
  @Roles(Role.OWNER, Role.SUPERADMIN)
  async updateCaffeManager(
    @Body()
    body: {
      oldManagerId: number;
      newManagerId: number;
      caffeId: number;
    },
  ) {
    return this.caffeService.updateCaffeManager(
      body.oldManagerId,
      body.caffeId,
      body.newManagerId,
    );
  }
}
