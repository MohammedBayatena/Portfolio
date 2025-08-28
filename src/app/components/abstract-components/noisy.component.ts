import {Component, Input} from '@angular/core';
import {AudioHelper} from '../../utils/audio-helper';

@Component({
  selector: 'app-noisy-component',
  template: ``
})
export abstract class NoisyComponent {

  abstract noiseUrl: string;

  makeSound(): void {
    AudioHelper.playSound(this.noiseUrl)
  };
}
