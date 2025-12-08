// src/common/validators/itinerary-length.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function ItineraryWithinDays(property: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'ItineraryWithinDays',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any[], args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = args.object[relatedPropertyName];
          const days = parseInt(relatedValue, 10);
          return Array.isArray(value) && !isNaN(days) && value.length <= days;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `Itinerary length must not exceed number of ${relatedPropertyName} days`;
        },
      },
    });
  };
}
