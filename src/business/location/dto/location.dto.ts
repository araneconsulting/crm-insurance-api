import { BusinessInfo } from "business/company/dto/company.dto";
import { IsArray, IsEmail, IsNotEmpty, IsNotEmptyObject, IsOptional } from "class-validator";
import { Address } from "shared/sub-documents/address";

export class CompanyDto {
    
    readonly alias: string;
    readonly info: BusinessInfo;
    readonly payFrequency: string;
}