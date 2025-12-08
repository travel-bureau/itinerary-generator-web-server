// src/common/validators/days-within-date-range.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function DaysWithinDateRange(fromKey: string, toKey: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'DaysWithinDateRange',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [fromKey, toKey],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [fromKey, toKey] = args.constraints;
          const fromDate = new Date(args.object[fromKey]);
          const toDate = new Date(args.object[toKey]);

          if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return false;
          const maxDays = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          return typeof value === 'number' && value >= 1 && value <= maxDays;
        },
        defaultMessage(args: ValidationArguments) {
          const [fromKey, toKey] = args.constraints;
          return `Days must be between 1 and the number of days between ${fromKey} and ${toKey}`;
        },
      },
    });
  };
}
