import { BusinessInfoDto } from "business-management/company/dto/company.dto";
import { IsArray, IsEmail, IsNotEmpty, IsNotEmptyObject, IsOptional } from "class-validator";
import { AddressDto } from "shared/dto/address.dto";

export class CompanyDto {
    
    readonly alias: string;
    readonly info: BusinessInfoDto;
    readonly payFrequency: string;
}