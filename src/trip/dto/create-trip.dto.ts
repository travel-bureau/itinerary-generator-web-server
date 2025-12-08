import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
  ArrayMinSize,
  IsInt, 
  Min,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';
import { CostItemInput } from './cost-item.input';
import { ItineraryItemInput } from './itinerary-item.input';
import { ItineraryWithinDays } from '../../common/validators/itinerary-length.validator';
import { DaysWithinDateRange } from '../../common/validators/days-within-date-range.validator';

@InputType()
export class CreateTripInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  destination: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  pax: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  fromDate: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  toDate: string;

  @Field()
  @IsInt()
  @Min(1)
  @DaysWithinDateRange('fromDate', 'toDate', {
    message: 'Days must not exceed the range between fromDate and toDate',
  })
  days: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  inclusions: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  exclusions: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  approximateCost: string;

  @Field(() => [CostItemInput])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => CostItemInput)
  costs: CostItemInput[];

  @Field(() => [ItineraryItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryItemInput)
  @ItineraryWithinDays('days')
  itinerary: ItineraryItemInput[];

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  useCache: boolean;
}
