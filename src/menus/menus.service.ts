import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Menu, Role } from '@prisma/client';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuDto: CreateMenuDto, req: any): Promise<Menu> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: req.user.sub,
        },
        include: {
          caffeManager: {
            include: {
              caffe: true,
            },
          },
        },
      });

      if (user.role == Role.SUPERADMIN) {
        return await this.prisma.menu.create({
          data: createMenuDto,
        });
      }

      const managedCaffe = user?.caffeManager?.find(
        (manager) => manager.caffeId === createMenuDto.caffeId,
      );

      if (!managedCaffe) {
        throw new UnauthorizedException(
          'User is not authorized to create a menu for this café',
        );
      }
      return await this.prisma.menu.create({
        data: {
          ...createMenuDto,
          caffeId: managedCaffe.caffeId,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(query: any): Promise<{ data: Menu[]; total: number }> {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 3;

    if (query.caffeId) {
      const [data, total] = await Promise.all([
        this.prisma.menu.findMany({
          where: { caffeId: parseInt(query.caffeId) },
          skip: limit * (page - 1),
          take: limit,
          include: {
            caffe: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        this.prisma.menu.count(),
      ]);

      return { data, total };
    }

    const [data, total] = await Promise.all([
      this.prisma.menu.findMany({
        skip: limit * (page - 1),
        take: limit,
        include: {
          caffe: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.menu.count(),
    ]);

    return { data, total };
  }

  async findOne(id: number, req: any): Promise<Menu> {
    try {
      if (req.user.role === Role.SUPERADMIN) {
        return await this.prisma.menu.findUniqueOrThrow({
          where: { id },
        });
      }

      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          id: req.user.sub,
        },
        include: {
          caffeManager: true,
        },
      });

      const managedCaffeIds = user.caffeManager.map(
        (manager) => manager.caffeId,
      );
      const menu = await this.prisma.menu.findUniqueOrThrow({
        where: {
          id,
        },
      });

      if (!managedCaffeIds.includes(menu.caffeId)) {
        throw new UnauthorizedException(
          'You are not authorized to access this menu',
        );
      }

      return menu;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Menu not found`);
      }
      throw error;
    }
  }

  async findByManager(query: any, req: any) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 3;

    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: req.user.sub,
      },
      include: {
        caffeManager: true,
      },
    });

    const managedCaffeIds = user.caffeManager.map((manager) => manager.caffeId);

    const [data, total] = await Promise.all([
      this.prisma.menu.findMany({
        skip: limit * (page - 1),
        take: limit,
        where: {
          caffeId: {
            in: managedCaffeIds,
          },
        },
      }),
      this.prisma.menu.count({
        where: {
          caffeId: {
            in: managedCaffeIds,
          },
        },
      }),
    ]);
    return { data, total };
  }

  async update(
    id: number,
    updateMenuDto: UpdateMenuDto,
    req: any,
  ): Promise<Menu> {
    try {
      if (req.user.role === Role.SUPERADMIN) {
        return await this.prisma.menu.update({
          where: { id },
          data: updateMenuDto,
        });
      }

      const menu = await this.prisma.menu.findUniqueOrThrow({
        where: { id },
        include: {
          caffe: {
            include: {
              managers: true,
            },
          },
        },
      });

      const isManager = menu.caffe.managers.some(
        (manager) => manager.managerId === req.user.sub,
      );

      if (isManager) {
        return await this.prisma.menu.update({
          where: { id },
          data: updateMenuDto,
        });
      }

      throw new UnauthorizedException(
        'You are not authorized to update this menu',
      );
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Menu not found`);
      }
      throw error;
    }
  }

  async remove(id: number, req: any): Promise<Menu> {
    try {
      if (req.user.role === Role.SUPERADMIN) {
        return await this.prisma.menu.delete({
          where: { id },
        });
      }

      const menu = await this.prisma.menu.findUniqueOrThrow({
        where: { id },
        include: {
          caffe: {
            include: {
              managers: true,
            },
          },
        },
      });

      const isManager = menu.caffe.managers.some(
        (manager) => manager.managerId === req.user.sub,
      );

      if (isManager) {
        return await this.prisma.menu.delete({
          where: { id },
        });
      }

      throw new UnauthorizedException();
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Menu not found`);
      }
      throw error;
    }
  }
}
