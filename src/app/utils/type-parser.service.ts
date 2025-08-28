import {SizeUnit} from '../services/file-system.service';

export class TypeParserService {

  public static parseSize(size: number | undefined, unit: SizeUnit | undefined): number {
    if (!size || !unit) return 0;
    const units = ['B', 'KB', 'MB', 'GB'];
    const value = parseFloat(size.toString());
    const unitIndex = units.indexOf(unit);
    return value * Math.pow(1024, unitIndex);
  }
}

