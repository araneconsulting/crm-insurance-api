import { Controller, Get, Param, Query, ParseBoolPipe, Req, UseGuards, DefaultValuePipe } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserService } from './user.service';

@Controller()
export class ProfileController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(
    @Query('withCompany', new DefaultValuePipe(false), ParseBoolPipe) withCompany: Boolean,
    @Query('withLocation', new DefaultValuePipe(false), ParseBoolPipe) withLocation: Boolean,
    @Query('withSupervisor', new DefaultValuePipe(false), ParseBoolPipe) withSupervisor: Boolean,
    @Req() req: Request,
  ): any {
    return this.userService.findById(
      req.user['id'],
      false,
      !!withCompany,
      !!withLocation,
      !!withSupervisor,
    );
  }
}
