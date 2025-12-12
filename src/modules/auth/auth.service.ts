import { BrevoService } from '@/email/brevo';
import { sendEmail } from '@/email/resend';
import { PrismaService } from '@/helper/prisma.service';
import { BrevoEmailParams } from '@/interface/brevo';
import { UserService } from '@/modules/user/user.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import e from 'express';
import { ApiError } from 'src/utils/api_error';
import { BcryptService } from 'src/utils/bcrypt.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private bcryptService: BcryptService,
    private configService: ConfigService,
    private brevoService: BrevoService,
    private prisma: PrismaService,
  ) { }

  // All User Resiger Here 

  async RegisterUser(data: any) {
       const repsonse = await this.prisma.$transaction(async (tx) => {
              const {trader, ...user} = data;
             
            const isUserExists = await this.usersService.getOne({ email: user.email });

            if (isUserExists) {
              throw new ApiError(HttpStatus.CONFLICT, 'User already exists');
            }

            user.password = await this.bcryptService.hash(user.password);
          
            const userData = await this.usersService.createUser(user);

           await this.prisma.trader.create({
              data: {
                userId: userData.id,
                ...trader
              }
            });

            return await this.prisma.user.findUnique({
              where: { id: userData.id },
              include: { trader: true }
            });
       })

       return repsonse
  }


  async login(data: {
    email: string;
    password?: string;
    avatar?: string;
    fullName?: string;
  }): Promise<{ access_token: string; refresh_token: string }> {
    const { email, password } = data;

    console.log(email,password, 'email and password in auth service');

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { admin: true }
    });

    console.log(user, 'user found in auth service');

    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
    }

    const isPasswordMatched = await this.bcryptService.compare(
      password,
      user.password!,
    );

    if (!isPasswordMatched) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Password is incorrect');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.username,
      avatar: user.avatar,
    };

    const accessToken = this.jwtService.signAsync(payload);

    const refreshToken = this.jwtService.signAsync(payload);

    return {
      access_token: await accessToken,
      refresh_token: await refreshToken,
    };
  }

  async getMe(user: User) {
  const include = user?.role === 'ADMIN'
    ? { admin: true }
    : { trader: true };

  const isUserExists = await this.prisma.user.findUnique({
    where: {
      email: user?.email,
    },
    include: include
  });

  console.log(isUserExists, 'isUserExists in getMe method');

  if (!isUserExists) {
    throw new ApiError(HttpStatus.NOT_FOUND, `User not found`);
  }

  return isUserExists;
}


  async changePassword({
    id,
    prevPass,
    newPass,
  }: {
    id: string;
    prevPass: string;
    newPass: string;
  }) {
    console.log(id);
    const isUserExists = await this.prisma.user.findUnique({ where: { id } });

    if (!isUserExists) {
      throw new ApiError(HttpStatus.NOT_FOUND, `user not found`);
    }

    const isPasswordMatched = await this.bcryptService.compare(
      prevPass,
      isUserExists.password!,
    );

    if (!isPasswordMatched) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Password is not matched!');
    }

    const hashPassword = await this.bcryptService.hash(newPass);

    const changePassword = await this.prisma.user.update({
      where: { id: isUserExists?.id },
      data: {
        password: hashPassword,
      },
    });

    if (!changePassword) {
      throw new ApiError(HttpStatus.NOT_FOUND, `password not updated`);
    }

    return 'password updated';
  }

  async forgetPassword({ email }: { email: string }) {
    const user = await this.usersService.getOne({ email });



    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, `User Not Found`);
    }

    const payload = {
      email: user.email,
      role: user.role,
    };

    console.log(user.email,'checking the email sending here');

    const resetPassToken = this.jwtService.signAsync(payload);

    const resetPasswordLink =`${process.env.RESET_PASSWORD_LINK}/reset-password?userId=${user.id}&token=${resetPassToken}`;

    const emailSending = {
      to: [ user?.email],
      subject: 'FourteenCapital - Reset Your Password',
      template: `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px; line-height: 1.6; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #FF7600; padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
            </div>
            <div style="padding: 40px 30px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Dear User,</p>
                
                <p style="font-size: 16px; margin-bottom: 30px;">We received a request to reset your password. Click the button below to reset your password:</p>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <a href=${resetPasswordLink} style="display: inline-block; background-color: #FF7600; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: 600; transition: background-color 0.3s ease;">
                        Reset Password
                    </a>
                </div>
                
                <p style="font-size: 16px; margin-bottom: 20px;">If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>
                
                <p style="font-size: 16px; margin-bottom: 0;">Best regards,<br>Your Support Team</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d;">
                <p style="margin: 0 0 10px;">This is an automated message, please do not reply to this email.</p>
                <p style="margin: 0;">© 2023 Your Company Name. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`,
      // optional:
      // cc: [ { email: 'boss@company.com', name: 'Boss' } ],
      // bcc: [ ... ],
      // textContent: 'Plain-text fallback here',
      // attachmentUrls: ['https://.../file.pdf'],
    };

    await sendEmail(emailSending);

    return {
      message: 'Reset password link sent via your email successfully',
    };
  }

  async resetPassword({
    token,
    payload: { id, password },
  }: {
    token: string;
    payload: { id: string; password: string };
  }) {
    const user = this.usersService.getOne({ email: id });

    console.log(`see user`, user);

    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, `User Not Found`);
    }

    const isValidToken = await this.jwtService.verifyAsync(token);

    if (!isValidToken) {
      throw new ApiError(HttpStatus.FORBIDDEN, `Forbidden`);
    }

    const hashPassword = await this.bcryptService.hash(password);

    await this.usersService.updatePassword({
      id: (await user)?.id,
      password: hashPassword,
    });
  }
}
