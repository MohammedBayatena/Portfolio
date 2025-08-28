export class AudioHelper {
  static playSound(src: string): void {
    const audio = new Audio();
    audio.src = src; // Ensure the path is correct
    audio.load(); // Preload the audio file
    audio.play().catch(error => console.error('Audio playback failed:', error));
  }
}
