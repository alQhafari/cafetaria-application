import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  price: number;

  @IsBoolean()
  @IsNotEmpty()
  isRecommendation: boolean;

  @IsNotEmpty()
  @IsNumber()
  caffeId: number;
}
