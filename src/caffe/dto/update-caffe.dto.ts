import { PartialType } from '@nestjs/mapped-types';
import { CreateCaffeDto } from './create-caffe.dto';

export class UpdateCaffeDto extends PartialType(CreateCaffeDto) {}
