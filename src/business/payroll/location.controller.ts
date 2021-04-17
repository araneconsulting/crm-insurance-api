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
  Scope,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { RoleType } from '../../shared/enum/role-type.enum';
import { HasRoles } from '../../auth/guard/has-roles.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { ParseObjectIdPipe } from '../../shared/pipe/parse-object-id.pipe';
import { Location } from '../../database/location.model';
import { LocationService } from './location.service';
import { MongoFilter } from 'shared/filter/mongo.filter';
import { CreateLocationDto } from 'business/location/dto/create-location.dto';
import { UpdateLocationDto } from 'business/location/dto/update-location.dto';

@Controller({ path: 'locations', scope: Scope.REQUEST })
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get()
  @HttpCode(200)
  @HasRoles(RoleType.SUPER_ADMIN,RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllLocations(
    @Query('q') keyword?: string,
    @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit?: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
  ): Promise<Location[]> {
    return await this.locationService.findAll(keyword, skip, limit);
  }

  @Get(':id')
  @HttpCode(200)
  //@HasRoles(RoleType.SUPER_ADMIN,RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getLocationById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Location> {
    return await this.locationService.findById(id);
  }

  @Post()
  @HttpCode(201)
  @HasRoles(RoleType.SUPER_ADMIN,RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters( MongoFilter)
  async createLocation(@Body() location: CreateLocationDto): Promise<Location> {
    return await this.locationService.save(location);
  }

  @Put(':id')
  @HttpCode(200)
  @HasRoles(RoleType.SUPER_ADMIN,RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters( MongoFilter)
  async updateLocation(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() location: UpdateLocationDto,
  ): Promise<Location> {
    return await this.locationService.update(id, location);
  }

  @Delete(':id')
  @HasRoles(RoleType.SUPER_ADMIN,RoleType.ADMIN)
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteLocationById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Location> {
    return await this.locationService.deleteById(id);
  }
}
