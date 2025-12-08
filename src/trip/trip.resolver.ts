import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { TripService } from './trip.service';
import { CreateTripInput } from './dto/create-trip.dto';
import { Trip } from './schemas/trip.schema';

@Resolver(() => Trip)
export class TripResolver {
  constructor(private readonly tripService: TripService) {}

  @Mutation(() => String)
  async generatePdf(@Args('input') input: CreateTripInput): Promise<string> {
    const buffer = await this.tripService.generatePdf(input);
    return buffer.toString('base64'); // or return a success message
  }

  @Mutation(() => String)
  async getPdfFromDb(@Args('input') input: CreateTripInput): Promise<string> {
    const buffer = await this.tripService.getPdfFromDb(input);
    return buffer.toString('base64'); // or return a success message
  }

  @Mutation(() => Trip)
  async createTrip(@Args('input') input: CreateTripInput): Promise<Trip> {
    return this.tripService.create(input);
  }

  @Query(() => [Trip])
  async findAllTrips(): Promise<Trip[]> {
    return this.tripService.findAll();
  }

  @Mutation(() => String)
  async createTripAndFetchPdf(@Args('input') input: CreateTripInput): Promise<string> {
    // Step 1: Save trip details
    const createTrip = await this.tripService.create(input);

    // Step 2: Get new pdf if from GCP response
    const newPdfId = await this.tripService.sendToGcp(input);

    // Step 3: Fetch PDF binary from MongoDB
    const buffer = await this.tripService.getPdfById(newPdfId);

    // Step 4: Return base64 to client
    return buffer.toString('base64');
  }

}
