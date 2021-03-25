import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Redirect,
  Res,
  Scope,
  UseGuards
} from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { RoleType } from '../../shared/enum/role-type.enum';
import { HasRoles } from '../../auth/guard/has-roles.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { ParseObjectIdPipe } from '../../shared/pipe/parse-object-id.pipe';
import { Insurer } from '../../database/insurer.model';
import { CreateInsurerDto } from './create-insurer.dto';
import { InsurerService } from './insurer.service';
import { UpdateInsurerDto } from './update-insurer.dto';

@Controller({ path: 'insurers', scope: Scope.REQUEST })
export class InsurerController {
  constructor(private insurerService: InsurerService) { }

  @Get('')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAllInsurers(
    @Query('q') keyword?: string,
    @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit?: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
  ): Observable<Insurer[]> {
    return this.insurerService.findAll(keyword, skip, limit);
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getInsurerById(@Param('id', ParseObjectIdPipe) id: string): Observable<Insurer> {
    return this.insurerService.findById(id);
  }

  @Post('')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(RoleType.OWNER, RoleType.ADMIN, RoleType.LEGAL, RoleType.MANAGER)
  createInsurer(
    @Body() insurer: CreateInsurerDto
  ): Observable<Insurer> {
    return from(this.insurerService.save(insurer));
  }

  @Put(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(RoleType.OWNER, RoleType.ADMIN, RoleType.LEGAL, RoleType.MANAGER)
  updateInsurer(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() insurer: UpdateInsurerDto,
    
  ): Observable<Insurer> {
    return from(this.insurerService.update(id, insurer));
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(RoleType.OWNER, RoleType.ADMIN)
  deleteInsurerById(
    @Param('id', ParseObjectIdPipe) id: string
  ): Observable<Insurer> {
    return this.insurerService.deleteById(id);
  }
}
