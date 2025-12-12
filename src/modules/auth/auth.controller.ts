import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { IsPublic } from './auth.decorator';
import { Request } from 'express';
import { ResponseService } from '@/utils/response';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { Roles } from './roles.decorator';
import { Role } from '@prisma/client';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) { }


  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @Post('register')
  @ApiOperation({ summary: 'User Register' })
  async register(@Body() registerDto: any) {
    const result = await this.authService.RegisterUser(registerDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'User Register successfully',
      data: result,
    });
  }

  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  async signIn(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'User Login successfully',
      data: result,
    });
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('get-me')
  async getProfile(@Req() req: Request) {
    const user: any = req?.user;
    const result = await this.authService.getMe(user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Getme Found successfully',
      data: result,
    });
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('change-password')
  async changePassword(
    @Body() data: { prevPass: string; newPass: string },
    @Req() req: Request,
  ) {
    const user: any = req?.user;
    const id: string = user?.id;
    const result = await this.authService.changePassword({ ...data, id });

    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Password Changed successfully',
      data: result,
    });
  }

  @IsPublic()
  @Post('forgot-password')
  async forgotPasswod(@Body() data: { email: string }) {
    console.log("excution project here/11");
    const result = await this.authService.forgetPassword({
      email: data?.email,
    });
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Forget Password Mail Sent successfully',
      data: result,
    });
  }


  @Post('reset-password')
  async resetPassword(
    @Headers('authorization') token: string,
    @Body() payload: { prevPass: string; newPass: string },
    @Req() req: Request
  ) {
    const user: any = req?.user;

    const result = await this.authService.resetPassword({
      token,
      payload: {
        id: user?.id,
        password: payload.newPass,
      },
    });

    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Password Resetted successfully',
      data: result,
    });
  }
}
