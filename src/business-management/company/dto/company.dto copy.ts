import { IsArray, IsEmail, IsNotEmpty, IsOptional } from "class-validator";
import { AddressDto } from "shared/dto/address.dto";

export class CompanyDto {
    
    @IsOptional()
    readonly address: AddressDto;

    @IsOptional()
    @IsNotEmpty()
    readonly code: string;
    
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsOptional()
    @IsNotEmpty()
    readonly fax: string;

    @IsOptional()
    @IsNotEmpty()
    readonly industry: string; //can be: Auto Parts, Entertainment, Chemical, Engineering, etc

    @IsOptional()
    @IsNotEmpty()
    readonly logo: string;

    @IsNotEmpty()
    readonly name: string;

    @IsOptional()
    @IsArray()
    readonly otherPhones: string[]; // delimited by-comma string
    
    @IsOptional()
    @IsNotEmpty()
    readonly primaryPhone: string;

    @IsOptional()
    @IsNotEmpty()
    readonly primaryPhoneExtension: string;

    @IsOptional()
    @IsNotEmpty()
    readonly secondaryPhone: string;

    @IsOptional()
    @IsNotEmpty()
    readonly secondaryPhoneExtension: string;

    @IsOptional()
    @IsNotEmpty()
    readonly sector: string; // can be: Financial, Technology, Healthcare, etc

    @IsOptional()
    @IsNotEmpty()
    readonly startedAt: string;

    @IsOptional()
    @IsNotEmpty()
    readonly type: string; 

    @IsOptional()
    @IsNotEmpty()
    readonly website: string;
}