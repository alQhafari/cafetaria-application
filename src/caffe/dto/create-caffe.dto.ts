import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateCaffeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @Matches(/^\+62[0-9]{9,12}$/, {
    message: 'Phone number must be in the format +62 followed by 9-12 digits',
  })
  phoneNumber: string;
}
