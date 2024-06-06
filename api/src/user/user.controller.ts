import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  loginUser(@Body() data: { email: string; password: string }) {
    this.userService
      .loginUser(data)
      .then(async (data) => {
        return {
          ...data,
          token: await this.jwtService.signAsync(data),
        };
      })
      .catch((err) => {
        throw new UnauthorizedException(err);
      });
  }

  @Post('register')
  registerUser(
    @Body()
    data: {
      name: string;
      email: string;
      password: string;
      profile: string;
    },
  ) {
    this.userService
      .registerUser(data as any)
      .then(async (data) => {
        return {
          ...data,
          token: await this.jwtService.signAsync(data),
        };
      })
      .catch((err) => {
        throw new UnauthorizedException(err);
      });
  }
}
