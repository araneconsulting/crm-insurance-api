import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  ExceptionFilter,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Response,
  Scope,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { RoleType } from '../../shared/enum/role-type.enum';
import { HasRoles } from '../../auth/guard/has-roles.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { ParseObjectIdPipe } from '../../shared/pipe/parse-object-id.pipe';
import { Company } from '../../database/company.model';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { MongoFilter } from 'shared/filter/mongo.filter';
import { User } from 'database/user.model';
import { Request } from 'express';
import { isAdmin, isSuperAdmin } from 'shared/util/user-functions';
import { UserService } from 'user/user.service';
import { LocationService } from 'business/location/location.service';
import { CustomerService } from 'insurance/customer/customer.service';
import { Types } from 'mongoose';
import { InsurerService } from 'insurance/insurer/insurer.service';
import { UserCatalog } from 'shared/const/catalog/user';
import { DateCatalog } from 'shared/const/catalog/date';

@Controller({ path: 'companies', scope: Scope.REQUEST })
export class CompanyController {
  constructor(
    private companyService: CompanyService,
    private userService: UserService,
    private locationService: LocationService,
    private customerService: CustomerService,
    private insurerService: InsurerService,
  ) {}

  @Get()
  @HttpCode(200)
  @HasRoles(RoleType.SUPER, RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllCompanies(
    @Query('q') keyword?: string,
    @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit?: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
  ): Promise<Company[]> {
    return await this.companyService.findAll(keyword, skip, limit);
  }

  @Get(':id')
  @HttpCode(200)
  //@HasRoles(RoleType.SUPER,RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getCompanyById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Company> {
    return await this.companyService.findById(id);
  }

  @Post()
  @HttpCode(201)
  @HasRoles(RoleType.SUPER, RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async createCompany(@Body() company: CreateCompanyDto): Promise<Company> {
    return await this.companyService.save(company);
  }

  @Put(':id')
  @HttpCode(200)
  @HasRoles(RoleType.SUPER, RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async updateCompany(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() company: UpdateCompanyDto,
  ): Promise<Company> {
    return await this.companyService.update(id, company);
  }

  @Delete(':id')
  @HasRoles(RoleType.SUPER, RoleType.ADMIN)
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteCompanyById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Company> {
    return await this.companyService.deleteById(id);
  }

  @Post('/catalog')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getCatalog(@Req() req: Request, @Response() res): Promise<any> {
    const user: Partial<User> = req.user;

    if (!user.company && !isSuperAdmin(user)) throw new BadRequestException(user.company);

    const companyFilter = { id: user.company.id };
    const entitiesFilter = { company: user.company };

    return res.json({
      companies:  await this.companyService.getCatalog(companyFilter),
      users:  await this.userService.getCatalog(entitiesFilter),
      locations: await this.locationService.getCatalog(entitiesFilter),
      customers: await this.customerService.getCatalog(entitiesFilter),
      insurers: await this.insurerService.getCatalog(entitiesFilter),
      roles: UserCatalog.roles,
      dateRanges: DateCatalog.ranges,
    });
  }
}
