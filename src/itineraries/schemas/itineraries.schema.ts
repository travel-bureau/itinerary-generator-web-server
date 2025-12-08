// src/pdf/schemas/pdf-record.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PdfRecordDocument = PdfRecord & Document;

@Schema({ collection: 'itineraries' }) // use your actual collection name
export class PdfRecord {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop()
  barcode_id: string;

  @Prop()
  traveler_name: string;

  @Prop()
  destination: string;

  @Prop()
  trip_title: string;

  @Prop()
  trip_dates: string;

  @Prop()
  created_at: Date;

  @Prop({ type: Buffer })
  pdf_data: Buffer;
}

export const PdfRecordSchema = SchemaFactory.createForClass(PdfRecord);
