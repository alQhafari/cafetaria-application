import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, User } from '@prisma/client';
import { getAllInterceptor } from 'src/common/interceptors/getAll.interceptor';
import { Roles } from 'src/auth/common/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.SUPERADMIN)
  async create(
    @Body(ValidationPipe)
    createUserDto: CreateUserDto,
  ): Promise<User> {
    return await this.userService.create(createUserDto);
  }

  @UseInterceptors(getAllInterceptor)
  @Get()
  @Roles(Role.SUPERADMIN)
  async findAll(@Query() query: any) {
    return await this.userService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    UpdateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, UpdateUserDto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
