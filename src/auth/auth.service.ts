import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { loginDto } from './dto/login.dto';
import { Role, User } from '@prisma/client';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(loginDto: loginDto): Promise<any> {
    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        username: loginDto.username,
      },
    });
    if (user && bcrypt.compareSync(loginDto.password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: loginDto): Promise<any> {
    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        username: loginDto.username,
      },
    });
    if (user && bcrypt.compareSync(loginDto.password, user.password)) {
      const payload = {
        fullname: user.fullname,
        username: user.username,
        role: user.role,
        sub: user.id,
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    }
    throw new UnauthorizedException();
  }

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        fullname: createUserDto.fullname,
        password: hashedPassword,
      },
    });
    return this.login(createUserDto);
  }
}
