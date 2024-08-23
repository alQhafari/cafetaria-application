import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCaffeDto } from './dto/create-caffe.dto';
import { UpdateCaffeDto } from './dto/update-caffe.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Caffe, CaffeOwner, Menu, Role } from '@prisma/client';

@Injectable()
export class CaffeService {
  constructor(private prisma: PrismaService) {}

  async create(createCaffeDto: CreateCaffeDto, req: any): Promise<Caffe> {
    return this.prisma.$transaction(async (prisma) => {
      const caffe = await prisma.caffe.create({ data: createCaffeDto });
      if (req.user.role === Role.OWNER) {
        await prisma.caffeOwner.create({
          data: {
            ownerId: req.user.sub,
            caffeId: caffe.id,
          },
        });
      }
      return caffe;
    });
  }

  async findAll(query: any): Promise<{ data: Caffe[]; total: number }> {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 3;

    const [data, total] = await Promise.all([
      this.prisma.caffe.findMany({
        skip: limit * (page - 1),
        take: limit,
        include: {
          owners: {
            select: {
              owner: {
                select: {
                  id: true,
                  fullname: true,
                  username: true,
                  role: true,
                },
              },
            },
          },
          managers: {
            select: {
              manager: {
                select: {
                  id: true,
                  username: true,
                  fullname: true,
                  role: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.caffe.count(),
    ]);

    return { data, total };
  }

  async findByOwner(query: any, req: any) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 3;

    const [data, total] = await Promise.all([
      this.prisma.caffe.findMany({
        skip: limit * (page - 1),
        take: limit,
        where: {
          owners: {
            some: {
              ownerId: req.user.id,
            },
          },
        },
      }),
      this.prisma.caffe.count({
        where: {
          owners: {
            some: {
              ownerId: req.user.id,
            },
          },
        },
      }),
    ]);
    return { data, total };
  }

  async findMenuByCaffe(id: number): Promise<Menu[]> {
    try {
      return await this.prisma.menu.findMany({
        where: {
          caffeId: id,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Caffe not found`);
      }
      throw error;
    }
  }

  async findOne(id: number, req: any): Promise<Caffe> {
    try {
      const caffe = await this.prisma.caffe.findUniqueOrThrow({
        where: { id },
        include: {
          owners: true,
          menus: {
            select: {
              id: true,
              name: true,
              price: true,
              isRecommendation: true,
            },
          },
        },
      });

      if (caffe.owners.some((owner) => owner.ownerId === req.user.sub)) {
        return caffe;
      }

      throw new UnauthorizedException();
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Caffe not found`);
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateCaffeDto: UpdateCaffeDto,
    req: any,
  ): Promise<Caffe> {
    try {
      const caffe = await this.prisma.caffe.findUniqueOrThrow({
        where: { id },
        include: {
          owners: true,
        },
      });

      if (caffe.owners.some((owner) => owner.ownerId === req.user.sub)) {
        return await this.prisma.caffe.update({
          where: { id },
          data: updateCaffeDto,
        });
      }

      throw new UnauthorizedException();
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Caffe not found`);
      }
      throw error;
    }
  }

  async remove(id: number, req: any): Promise<Caffe> {
    try {
      const caffe = await this.prisma.caffe.findUniqueOrThrow({
        where: { id },
        include: {
          owners: true,
        },
      });

      if (caffe.owners.some((owner) => owner.ownerId === req.user.sub)) {
        return await this.prisma.caffe.delete({
          where: { id },
        });
      }

      throw new UnauthorizedException();
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Caffe not found`);
      }
      throw error;
    }
  }

  async addCaffeOwner(ownerId: number, caffeId: number) {
    try {
      await this.prisma.caffe.findUniqueOrThrow({
        where: { id: caffeId },
      });

      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: ownerId },
      });

      if (user.role !== 'OWNER') {
        throw new BadRequestException('User must be an OWNER');
      }

      return await this.prisma.caffeOwner.create({
        data: {
          ownerId,
          caffeId,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User of Caffe not found');
      }
      throw new BadRequestException('Failed to add Caffe owner');
    }
  }

  async addCaffeManager(managerId: number, caffeId: number) {
    try {
      await this.prisma.caffe.findUniqueOrThrow({
        where: { id: caffeId },
      });

      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: managerId },
      });

      if (user.role !== 'MANAGER') {
        throw new BadRequestException('User must be an MANAGER');
      }

      return this.prisma.caffeManager.create({
        data: {
          managerId,
          caffeId,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User of Caffe not found');
      }
      throw new BadRequestException('Failed to add Caffe manager');
    }
  }

  async updateCaffeOwner(
    oldOwnerId: number,
    caffeId: number,
    newOwnerId: number,
  ) {
    try {
      const oldOwner = await this.prisma.caffeOwner.findUnique({
        where: {
          ownerId_caffeId: { ownerId: oldOwnerId, caffeId },
        },
      });

      if (!oldOwner) {
        throw new NotFoundException(
          'The old owner does not exist for this Caffe.',
        );
      }

      const newOwner = await this.prisma.user.findUniqueOrThrow({
        where: { id: newOwnerId },
      });

      if (newOwner.role !== 'OWNER') {
        throw new BadRequestException('User must be an OWNER');
      }

      await this.prisma.caffeOwner.delete({
        where: {
          ownerId_caffeId: { ownerId: oldOwnerId, caffeId },
        },
      });

      return this.prisma.caffeOwner.create({
        data: {
          ownerId: newOwnerId,
          caffeId,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update Caffe owner.');
    }
  }

  async updateCaffeManager(
    oldManagerId: number,
    caffeId: number,
    newManagerId: number,
  ) {
    try {
      const oldManager = await this.prisma.caffeManager.findUnique({
        where: {
          managerId_caffeId: { managerId: oldManagerId, caffeId },
        },
      });

      if (!oldManager) {
        throw new NotFoundException(
          'The old manager does not exist for this Caffe.',
        );
      }

      const newManager = await this.prisma.user.findUniqueOrThrow({
        where: { id: newManagerId },
      });

      if (newManager.role !== 'MANAGER') {
        throw new BadRequestException('User must be a MANAGER');
      }

      await this.prisma.caffeManager.delete({
        where: {
          managerId_caffeId: { managerId: oldManagerId, caffeId },
        },
      });

      return this.prisma.caffeManager.create({
        data: {
          managerId: newManagerId,
          caffeId,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update Caffe manager.');
    }
  }

  async deleteCaffeManager(managerId: number, caffeId: number) {
    try {
      const manager = await this.prisma.caffeManager.findUnique({
        where: {
          managerId_caffeId: { managerId, caffeId },
        },
      });

      if (!manager) {
        throw new NotFoundException(
          'The manager does not exist for this Caffe.',
        );
      }

      await this.prisma.caffeManager.delete({
        where: {
          managerId_caffeId: { managerId, caffeId },
        },
      });

      return { message: 'Manager deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete Caffe manager.');
    }
  }

  async deleteCaffeOwner(ownerId: number, caffeId: number) {
    try {
      const owner = await this.prisma.caffeOwner.findUnique({
        where: {
          ownerId_caffeId: { ownerId, caffeId },
        },
      });

      if (!owner) {
        throw new NotFoundException('The owner does not exist for this Caffe.');
      }

      await this.prisma.caffeOwner.delete({
        where: {
          ownerId_caffeId: { ownerId, caffeId },
        },
      });

      return { message: 'Owner deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete Caffe owner.');
    }
  }
}
