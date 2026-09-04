import { BadRequestException, Injectable } from '@nestjs/common';
import { Unit } from './enums/unit.enum.js';
import { ObjectProperties } from './interfaces/object-properties.interface.js';

const REQUIRED_PROPERTIES: Record<Unit, (keyof ObjectProperties)[]> = {
  [Unit.METER]: ['length'],
  [Unit.SQUARE_METER]: ['length', 'height'],
  [Unit.CUBIC_METER]: ['length', 'height', 'thickness'],
  [Unit.KILOGRAM]: ['length', 'height', 'thickness', 'density'],
  [Unit.PIECE]: ['count'],
};

@Injectable()
export class QuantityService {
  validateProperties(unit: Unit, properties: ObjectProperties): void {
    const missing = REQUIRED_PROPERTIES[unit].filter((key) => {
      const value = properties[key];
      return typeof value !== 'number' || !(value > 0);
    });
    if (missing.length > 0) {
      throw new BadRequestException(
        `unit "${unit}" requires properties: ${missing.join(', ')}`,
      );
    }
  }

  calculate(unit: Unit, properties: ObjectProperties): number {
    const {
      length = 0,
      height = 0,
      thickness = 0,
      density = 0,
      count = 0,
    } = properties;

    switch (unit) {
      case Unit.METER:
        return length;
      case Unit.SQUARE_METER:
        return length * height;
      case Unit.CUBIC_METER:
        return length * height * thickness;
      case Unit.KILOGRAM:
        return length * height * thickness * density;
      case Unit.PIECE:
        return count;
    }
  }
}
