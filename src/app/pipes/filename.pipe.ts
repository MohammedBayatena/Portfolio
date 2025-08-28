import {Pipe, PipeTransform} from '@angular/core';
import {TrimPipe} from './trim-pipe';

@Pipe({
  name: 'filename',
  standalone: true,
})
export class FilenamePipe extends TrimPipe implements PipeTransform {
  override transform(value: string): string {
    if (!value) return 'File';

    // Extract filename from URL or path
    const parts = value.split('/');
    const filename = parts[parts.length - 1];

    // Limit length for display
    return super.transform(filename);
  }
}
