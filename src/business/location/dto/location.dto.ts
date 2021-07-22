import { BusinessInfo } from "business/company/dto/company.dto";
import { IsArray, IsEmail, IsNotEmpty, IsNotEmptyObject, IsOptional } from "class-validator";
import { Company } from "database/company.model";
import { Address } from "shared/sub-documents/address";

export class CompanyDto {
    
    readonly alias: string;
    readonly company: Partial<Company>;
    readonly business: BusinessInfo;
    readonly payFrequency: string;
}