import { IsAlphanumeric, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, MaxLength, MinLength } from "class-validator";
import { LocationType } from "shared/enum/location-type.enum";
import { RoleType } from "shared/enum/role-type.enum";

export class RegisterDto {
    @IsNotEmpty()
    @IsAlphanumeric()
    readonly username: string;

    @IsNotEmpty()
    @IsEmail()
    //@Matches(/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i)
    readonly email: string;

    @IsNotEmpty()
    @MinLength(8, { message: " The min length of password is 8 " })
    @MaxLength(20, { message: " The password can't accept more than 20 characters " })
    // @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,20}$/,
    //     { message: " A password at least contains one numeric digit, one supercase char and one lowercase char" }
    // )
    readonly password: string;

    @IsNotEmpty()
    readonly firstName: string;

    @IsNotEmpty()
    readonly lastName: string;

    //Employee fields (this will be moved to a child class later)
    @IsOptional()
    @IsNotEmpty()
    readonly location?: string;
    
    @IsOptional()
    @IsNotEmpty()
    readonly position?: string;
    
    @IsOptional()
    @IsNotEmpty()
    @IsPhoneNumber()
    readonly phone?: string;
    
    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    readonly baseSalary?: number;

    @IsOptional()
    @IsNotEmpty()
    readonly roles?: RoleType[];
}
