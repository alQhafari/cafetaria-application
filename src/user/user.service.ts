import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createDtoUser: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createDtoUser.password, 10);

    const newUser = {
      ...createDtoUser,
      password: hashedPassword,
    };

    return this.prisma.user.create({
      data: newUser,
    });
  }

  async findAll(query: any): Promise<{ data: User[]; total: number }> {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 3;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: limit * (page - 1),
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

    return { data, total };
  }

  async findOne(id: number): Promise<User> {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User not found`);
      }
      throw error;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });

      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User not found`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<User> {
    try {
      await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });

      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User not found`);
      }
      throw error;
    }
  }
}
