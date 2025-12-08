// src/pdf/pdf.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PdfRecord, PdfRecordSchema } from './schemas/itineraries.schema';
import { PdfService } from './itineraries.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: PdfRecord.name, schema: PdfRecordSchema }])],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
