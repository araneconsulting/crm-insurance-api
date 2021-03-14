import { IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength } from "class-validator";
import { LocationType } from "shared/enum/location-type.enum";

export class UpdateUserDto {

    @IsOptional()
    @IsNotEmpty()
    readonly username: string;

    @IsOptional()
    @IsNotEmpty()
    @IsEmail()
    //@Matches(/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i)
    readonly email: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(8, { message: " The min length of password is 8 " })
    @MaxLength(20, { message: " The password can't accept more than 20 characters " })
    // @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,20}$/,
    //     { message: " A password at least contains one numeric digit, one supercase char and one lowercase char" }
    // )
    readonly password: string;

    @IsOptional()
    @IsNotEmpty()
    readonly firstName: string;

    @IsOptional()
    @IsNotEmpty()
    readonly lastName: string;


    //Employee fields (this will be moved to a child class later)
    @IsOptional()
    @IsNotEmpty()
    readonly location: string;

    @IsOptional()
    @IsNotEmpty()
    readonly position: string;

    @IsOptional()
    @IsNotEmpty()
    readonly baseSalary: number;
    
}
