// src/trip/dto/cost-item.input.ts
import { InputType, Field } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty
} from 'class-validator';

@InputType()
export class CostItemInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  details: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  entity: string;
}
