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
import { States } from 'shared/const/catalog/states';
import { Industries } from 'shared/const/catalog/industries';
import { CompanyCatalog } from 'shared/const/catalog/company';
import { LINES_OF_BUSINESS } from 'shared/const/catalog/lines-of-business';
import { COVERAGES_TYPES } from 'shared/const/catalog/coverages-types';
import { ENDORSEMENT_STATUS } from 'shared/const/catalog/endorsement-status';
import { ENDORSEMENT_TYPES } from 'shared/const/catalog/endorsement-types';
import { PERMIT_TYPES, PERMIT_TYPES_BY_STATE } from 'shared/const/catalog/permits-types';
import { ENDORSEMENT_ITEMS } from 'shared/const/catalog/endorsement-items';
import { ENDORSEMENT_ITEM_TYPES } from 'shared/const/catalog/endorsement-item-types';

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
  @HasRoles(RoleType.SUPER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllCompanies(
    @Query('q') keyword?: string,
    @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit?: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
  ): Promise<Company[]> {
    return await this.companyService.findAll(keyword, skip, limit);
  }

  @Get('my-company')
  @HttpCode(200)
  @HasRoles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getMyCompany(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Company> {
    return await this.companyService.getMyCompany();
  }

  @Get('my-company/employees')
  @HttpCode(200)
  @HasRoles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getMyCompanyEmployees(
    @Req() req: Request,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Company> {
    const user: Partial<User> = req.user;

    if (!user.company && !isSuperAdmin(user))
      throw new BadRequestException(user.company);
    const entitiesFilter = { company: user.company, deleted: false };

    let employeesFilter = entitiesFilter;
    employeesFilter['roles'] = { $nin: ['SUPER', 'ADMIN'] };
    return await this.userService.getEmployees(employeesFilter);
  }

  @Put('my-company')
  @HttpCode(200)
  @HasRoles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async updateMyCompany(@Body() company: UpdateCompanyDto): Promise<Company> {
    return await this.companyService.updateMyCompany(company);
  }

  @Get(':id')
  @HttpCode(200)
  @HasRoles(RoleType.SUPER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getCompanyById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Company> {
    return await this.companyService.findById(id);
  }

  @Post()
  @HttpCode(201)
  @HasRoles(RoleType.SUPER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async createCompany(@Body() company: CreateCompanyDto): Promise<Company> {
    return await this.companyService.save(company);
  }

  @Put(':id')
  @HttpCode(200)
  @HasRoles(RoleType.SUPER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MongoFilter)
  async updateCompany(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() company: UpdateCompanyDto,
  ): Promise<Company> {
    return await this.companyService.update(id, company);
  }

  @Delete(':id')
  @HasRoles(RoleType.SUPER)
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteCompanyById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Company> {
    return await this.companyService.deleteById(id);
  }

  @Post('/catalog')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async getCatalog(@Req() req: Request, @Response() res): Promise<any> {
    const user: Partial<User> = req.user;

    if (!user.company && !isSuperAdmin(user))
      throw new BadRequestException(user.company);

    const entitiesFilter = { company: user.company, deleted: false };

    let employeesFilter = entitiesFilter;
    employeesFilter['roles'] = { $nin: ['SUPER', 'ADMIN'] };

    const insurers: any = await this.insurerService.getCatalog(entitiesFilter);

    return res.json({
      brokers: insurers.brokers,
      carriers: insurers.carriers,
      company: await this.companyService.findById(user.company.toString()),
      coverages: COVERAGES_TYPES,
      customers: await this.customerService.getCatalog(entitiesFilter),
      dateRanges: DateCatalog.ranges,
      employees: await this.userService.getCatalog(employeesFilter),
      endorsementStatus: ENDORSEMENT_STATUS,
      endorsementTypes: ENDORSEMENT_TYPES,
      endorsementItems: ENDORSEMENT_ITEMS,
      endorsementItemTypes: ENDORSEMENT_ITEM_TYPES,
      employeeRateFrequencies: CompanyCatalog.employeeRateFrequencies,
      financers: insurers.financers,
      industries: Industries,
      linesOfBusiness: LINES_OF_BUSINESS,
      locations: await this.locationService.getCatalog(entitiesFilter),
      locationAvailableCountries: CompanyCatalog.locations.availableCountries,
      locationPayFrequencies: CompanyCatalog.locations.payrollFrequencies,
      permitTypes: PERMIT_TYPES,
      permitTypesByState: PERMIT_TYPES_BY_STATE,
      roles: UserCatalog.roles,
      states: States,
      users: await this.userService.getCatalog(entitiesFilter),
    });
  }
}
