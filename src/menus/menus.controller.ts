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
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu, Role } from '@prisma/client';
import { getAllInterceptor } from 'src/common/interceptors/getAll.interceptor';
import { Public } from 'src/auth/common/public.decorator';
import { Roles } from 'src/auth/common/roles.decorator';

@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @Roles(Role.MANAGER, Role.SUPERADMIN)
  async create(
    @Body(ValidationPipe) createMenuDto: CreateMenuDto,
    @Request() req: any,
  ): Promise<Menu> {
    return await this.menusService.create(createMenuDto, req);
  }

  @Get()
  @Roles(Role.MANAGER, Role.SUPERADMIN)
  @UseInterceptors(getAllInterceptor)
  async findAll(@Query() query: any, @Request() req: any) {
    if (req.user.role === Role.MANAGER) {
      return await this.menusService.findByManager(query, req);
    } else if (req.user.role === Role.OWNER) {
      throw new UnauthorizedException();
    }
    return this.menusService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.MANAGER, Role.SUPERADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.menusService.findOne(id, req);
  }

  @Patch(':id')
  @Roles(Role.MANAGER, Role.SUPERADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateMenuDto: UpdateMenuDto,
    @Request() req: any,
  ) {
    return this.menusService.update(id, updateMenuDto, req);
  }

  @Delete(':id')
  @Roles(Role.MANAGER, Role.SUPERADMIN)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.menusService.remove(id, req);
  }
}
