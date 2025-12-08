// src/pdf/pdf.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PdfRecord, PdfRecordDocument } from './schemas/itineraries.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class PdfService {
  constructor(@InjectModel(PdfRecord.name) private pdfModel: Model<PdfRecordDocument>) {}

  async getPdfBufferById(id: string): Promise<Buffer> {
    const objectId = new Types.ObjectId(id);
    const record = await this.pdfModel.findById(objectId).select('pdf_data').exec();

    if (!record || !record.pdf_data) {
      throw new NotFoundException('PDF not found in database');
    }

    return record.pdf_data;
  }
}
