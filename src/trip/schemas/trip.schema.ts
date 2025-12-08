// src/trip/schemas/trip.schema.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TripDocument = Trip & Document;

@Schema()
@ObjectType() // ✅ Required for GraphQL output
export class Trip {
  @Field()
  @Prop()
  title: string;

  @Field()
  @Prop()
  destination: string;

  @Field()
  @Prop()
  name: string;

  @Field()
  @Prop()
  pax: string;

  @Field()
  @Prop()
  fromDate: Date;

  @Field()
  @Prop()
  toDate: Date;

  @Field(() => Int)
  @Prop()
  days: number;

  @Field()
  @Prop()
  inclusions: string;

  @Field()
  @Prop()
  exclusions: string;

  @Field()
  @Prop()
  approximateCost: string;

  @Field(() => [CostItem])
  @Prop({ type: [{ details: String, entity: String }] })
  costs: CostItem[];

  @Field(() => [ItineraryItem])
  @Prop({ type: [{ details: String, number: String }] })
  itinerary: ItineraryItem[];

  @Field(() => Boolean)
  @Prop({ default: true })
  useCache: boolean;

  @Prop({ required: true, default: () => new Date() })
  created_at: Date;
}

@ObjectType()
export class CostItem {
  @Field()
  details: string;

  @Field()
  entity: string;
}

@ObjectType()
export class ItineraryItem {
  @Field()
  details: string;

  @Field()
  number: string;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
