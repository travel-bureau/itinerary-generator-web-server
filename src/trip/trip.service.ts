import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateTripInput } from './dto/create-trip.dto';
import * as fs from 'fs';
import { join } from 'path';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { InjectModel } from '@nestjs/mongoose';
import { Trip, TripDocument } from './schemas/trip.schema';
import { Model } from 'mongoose';
import { PdfService } from '../itineraries/itineraries.service';
import { format } from 'date-fns';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { GoogleAuth, JWT } from 'google-auth-library';

@Injectable()
export class TripService {
  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    private readonly pdfService: PdfService,
    private readonly http: HttpService,
    private readonly config: ConfigService
  ) {}

  async create(input: CreateTripInput): Promise<Trip> {
    const createdTrip = new this.tripModel(input);
    return createdTrip.save();
  }

  async findAll(): Promise<Trip[]> {
    return this.tripModel.find().exec();
  }

  async generatePdf(input: CreateTripInput): Promise<Buffer> {
    // 🔍 Manual validation
    const instance = plainToInstance(CreateTripInput, input);
    const errors = await validate(instance);

    if (errors.length > 0) {
      const flattenErrors = (validationErrors: ValidationError[]): string[] => {
        const messages: string[] = [];

        for (const error of validationErrors) {
          if (error.constraints) {
            messages.push(...Object.values(error.constraints as Record<string, string>));
          }

          if (error.children && error.children.length > 0) {
            messages.push(...flattenErrors(error.children));
          }
        }

        return messages;
      };

      const messages = flattenErrors(errors).join('; ');
      throw new BadRequestException(`Validation failed: ${messages}`);
    }

    // 🧾 Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 10000));
    const filePath = join(process.cwd(), 'src', 'assets', 'sample.pdf');
    const pdfBuffer = fs.readFileSync(filePath);

    // 📦 Return base64 string
    return pdfBuffer;
  }

  async getPdfFromDb(input: CreateTripInput): Promise<Buffer> {
    // 🔍 Manual validation
    const instance = plainToInstance(CreateTripInput, input);
    const errors = await validate(instance);

    if (errors.length > 0) {
      const flattenErrors = (validationErrors: ValidationError[]): string[] => {
        const messages: string[] = [];

        for (const error of validationErrors) {
          if (error.constraints) {
            messages.push(...Object.values(error.constraints as Record<string, string>));
          }

          if (error.children && error.children.length > 0) {
            messages.push(...flattenErrors(error.children));
          }
        }

        return messages;
      };

      const messages = flattenErrors(errors).join('; ');
      throw new BadRequestException(`Validation failed: ${messages}`);
    }

    // 🧾 Extract existing pdf
    const hardcodedId = '68caad8fc268d9f4036ad360'; // replace with actual ObjectId
    const pdfBuffer = await this.pdfService.getPdfBufferById(hardcodedId);
    console.log(`Fetched PDF for ID: ${hardcodedId}, size: ${pdfBuffer.length} bytes`);

    // 📦 Return base64 string
    return pdfBuffer;
  }

  async getPdfById(id: string): Promise<Buffer> {
    return this.pdfService.getPdfBufferById(id);
  }

  async sendToGcp(input: CreateTripInput) {
    const payload = transformTripInput(input);
    const targetAudience = this.config.get<string>('GCP_FUNCTION_URL');

    const auth = new GoogleAuth({
      credentials: loadServiceAccountKey(),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    try {
      const credentials = loadServiceAccountKey();
      const jwtClient = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        targetAudience: targetAudience, // ✅ bypass TS restriction
      } as any);

      const identityToken = await jwtClient.fetchIdToken(targetAudience);

      const response = await firstValueFrom(
        this.http.post(
          targetAudience,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${identityToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        )
      );

      return response.data;
    } catch (e) {
      console.log(e);
      throw new Error('❌ Error occurred while sending gcp request');
    }
    
  }

}

function formatDate(iso: string): string {
  return format(new Date(iso), 'dd MMM yyyy');
}

function transformTripInput(input: CreateTripInput) {
  const tour_costs = Object.fromEntries(
    input.costs.map((item) => [item.entity, item.details])
  );

  const inclusions = parseList(input.inclusions);
  const exclusions = parseList(input.exclusions);

  const itinerary_text = [
    `${input.title}`,
    '',
    `Name: ${input.name}`,
    `Pax: ${input.pax}`,
    `Date: ${formatDate(input.fromDate)} - ${formatDate(input.toDate)}`,
    '',
    ...input.itinerary.map((item) => `Day ${item.number}: ${item.details}`)
  ].join('\n');

  return {
    trips: [
      {
        id: 1,
        trip_title: input.title,
        trip_dates: `${formatDate(input.fromDate)} - ${formatDate(input.toDate)}`,
        traveler_name: input.name,
        pax: input.pax,
        tour_costs,
        inclusions,
        exclusions,
        destination: input.destination,
        itinerary_text,
        useCache: input.useCache
      }
    ]
  };
}

function parseList(raw: string): string[] {
  if (!raw) return [];

  const hasComma = raw.includes(',');
  const hasNewline = raw.includes('\n');

  const delimiter = hasComma && !hasNewline ? ',' : '\n';

  return raw
    .split(delimiter)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function loadServiceAccountKey(): Record<string, any> {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const raw = process.env.GCP_SA_KEY;
    if (!raw) throw new Error('❌ Missing GCP_SA_KEY in production');

    try {
      return JSON.parse(raw);
    } catch (e) {
      throw new Error('❌ GCP_SA_KEY is not valid JSON');
    }
  }

  // Dev mode: read from file
  const path = 'keys/sa-key.json';
  if (!fs.existsSync(path)) throw new Error(`❌ SA key file not found at ${path}`);
  
  const sa_key = JSON.parse(fs.readFileSync(path, 'utf8'));

  return sa_key;
}
