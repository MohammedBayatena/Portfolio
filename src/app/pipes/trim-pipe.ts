import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'trim'
})
export class TrimPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';

    return value.length > 30 ? value.substring(0, 27) + '...' : value;

  }

}
