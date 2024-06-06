import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import type { user as UserType } from '@prisma/client';

type UserResponseType = {
  id?: string;
  email: string;
  name: string;
  profile: string;
  password?: string;
};

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private findUser(
    data: { id: string; email?: never } | { id?: never; email: string },
  ) {
    return new Promise<UserType>((resolve, reject) => {
      this.prisma.user
        .findFirst({ where: data })
        .then(resolve)
        .catch((err) => {
          reject({
            message: `Failed to find user`,
            err,
          });
        });
    });
  }

  registerUser(data: UserType) {
    return new Promise<UserResponseType>(async (resolve, reject) => {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      this.prisma.user
        .create({
          data: {
            ...data,
            password: hashedPassword,
          },
        })
        .then((user) => {
          resolve({
            id: user.id,
            name: user.name,
            email: user.email,
            profile: user.profile,
          });
        })
        .catch((err) => {
          /* 
            https://www.prisma.io/docs/reference/api-reference/error-reference
            error `P2002` = "Unique constraint failed on the {constraint}" 
            user is trying to signup with and email which is already exits
          */
          if (err.code == 'P2002') {
            return reject({ message: `${data.email} already exist`, err });
          }

          reject({ message: 'Failed to create user', err });
        });
    });
  }

  loginUser(data: { email: string; password: string }) {
    return new Promise<UserResponseType>((resolve, reject) => {
      this.findUser({ email: data.email })
        .then((user) => {
          bcrypt.compare(data.password, user.password, (err, pass) => {
            if (err) {
              return reject({
                message: 'Failed to validate password',
                err,
              });
            }

            if (!pass) {
              return reject({
                message: 'Invalid password',
                err,
              });
            }

            resolve({
              id: user.id,
              name: user.name,
              email: user.email,
              profile: user.profile,
            });
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
