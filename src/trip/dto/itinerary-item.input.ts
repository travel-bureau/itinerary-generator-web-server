// src/trip/dto/itinerary-item.input.ts
import { InputType, Field } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty
} from 'class-validator';

@InputType()
export class ItineraryItemInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  details: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  number: string;
}
