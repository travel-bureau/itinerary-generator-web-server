// src/trip/trip.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Trip, TripSchema } from './schemas/trip.schema';
import { TripService } from './trip.service';
import { TripResolver } from './trip.resolver';
import { PdfModule } from '../itineraries/itineraries.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
    PdfModule,
    HttpModule
  ],
  providers: [TripService, TripResolver],
})
export class TripModule {}
