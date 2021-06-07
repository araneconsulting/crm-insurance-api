import { IsArray, IsEmail, IsNotEmpty, IsOptional } from "class-validator";
import { Address } from "shared/sub-documents/address";

export class BusinessInfo {
    
    @IsOptional()
    readonly address: Address;
    
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsOptional()
    readonly fax: string;

    @IsOptional()
    readonly industry: string; //can be: Auto Parts, Entertainment, Chemical, Engineering, etc

    @IsOptional()
    readonly logo: string;

    @IsNotEmpty()
    readonly name: string;

    @IsOptional()
    @IsArray()
    readonly otherPhones: string[]; 
    
    @IsOptional()
    @IsNotEmpty()
    readonly primaryPhone: string;

    @IsOptional()
    readonly primaryPhoneExtension: string;

    @IsOptional()
    readonly secondaryPhone: string;

    @IsOptional()
    readonly secondaryPhoneExtension: string;

    @IsOptional()
    readonly sector: string; // can be: Financial, Technology, Healthcare, etc

    @IsOptional()
    readonly startedAt: string;

    @IsOptional()
    readonly type: string;  //LLC, INC

    @IsOptional()
    readonly website: string;
}