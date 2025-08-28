import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input, OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MediaFile} from '../../models/media-file.model';

@Component({
  selector: 'app-win98-media-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './win98-media-player.component.html',
  styleUrls: ['./win98-media-player.component.scss'],
})
export class Win98MediaPlayerComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() playlist: MediaFile[] = [];
  @Input() minimized: boolean = false;

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('audioElement') audioElement!: ElementRef<HTMLAudioElement>;

  constructor(private cdr: ChangeDetectorRef) {
  }

  // Media state
  currentTime = 0;
  duration = 0;
  volume = 0.7;
  isPlaying = false;
  isMuted = false;

  // Playlist
  currentTrack = 0;

  // Windows 98 style properties
  trackPosition = 0;
  volumePosition = 70;

  ngAfterViewInit() {
    this.loadMedia();
    this.setupEventListeners();
  }

  ngOnDestroy() {
    this.removeEventListeners();
  }

  ngOnChanges() {
    // You can react to the visibility change here if needed
    if (this.minimized && this.isPlaying) {
      this.togglePlayPause();
    }
  }


  setupEventListeners() {
    const video = this.videoElement?.nativeElement;
    const audio = this.audioElement?.nativeElement;

    if (video) {
      video.addEventListener('timeupdate', this.updateTime.bind(this));
      video.addEventListener('ended', this.onMediaEnded.bind(this));
      video.addEventListener(
        'loadedmetadata',
        this.onLoadedMetadata.bind(this)
      );
    }
    if (audio) {
      audio.addEventListener('timeupdate', this.updateTime.bind(this));
      audio.addEventListener('ended', this.onMediaEnded.bind(this));
      audio.addEventListener(
        'loadedmetadata',
        this.onLoadedMetadata.bind(this)
      );
    }
  }

  removeEventListeners() {
    const video = this.videoElement?.nativeElement;
    const audio = this.audioElement?.nativeElement;

    if (video) {
      video.removeEventListener('timeupdate', this.updateTime);
      video.removeEventListener('ended', this.onMediaEnded);
      video.removeEventListener('loadedmetadata', this.onLoadedMetadata);
    }

    if (audio) {
      audio.removeEventListener('timeupdate', this.updateTime);
      audio.removeEventListener('ended', this.onMediaEnded);
      audio.removeEventListener('loadedmetadata', this.onLoadedMetadata);
    }
  }

  onLoadedMetadata() {
    const mediaElement = this.getCurrentMediaElement();
    if (mediaElement) {
      this.duration = mediaElement.duration;
    }
  }

  getCurrentMediaElement(): HTMLMediaElement | null {
    const track = this.getTrack(this.currentTrack);
    if (track?.type === 'video') {
      return this.videoElement?.nativeElement || null;
    } else {
      return this.audioElement?.nativeElement || null;
    }
  }

  updateTime() {
    const mediaElement = this.getCurrentMediaElement();
    if (mediaElement) {
      this.currentTime = mediaElement.currentTime;
      this.trackPosition =
        this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
    }
    this.cdr.detectChanges();
  }

  onMediaEnded() {
    this.isPlaying = false;
    this.nextTrack();
  }

  loadMedia() {
    const mediaElement = this.getCurrentMediaElement();
    const track = this.getTrack(this.currentTrack);

    if (!mediaElement || !track) return;

    // Pause any playing media first
    this.stop();

    // Set source and load
    mediaElement.src = track.url;
    mediaElement.load();

    // Reset UI
    this.currentTime = 0;
    this.trackPosition = 0;
    this.duration = 0;
  }

  togglePlayPause() {
    const mediaElement = this.getCurrentMediaElement();
    if (!mediaElement) return;

    if (this.isPlaying) {
      mediaElement.pause();
    } else {
      mediaElement.play().catch((error) => {
        console.error('Error playing media:', error);
      });
    }
    this.isPlaying = !this.isPlaying;
  }

  isMediaPlaying(mediaElement: HTMLMediaElement): boolean {
    return (
      mediaElement.currentTime > 0 &&
      !mediaElement.paused &&
      !mediaElement.ended &&
      mediaElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
    );
  }

  stop() {
    const video = this.videoElement?.nativeElement;
    const audio = this.audioElement?.nativeElement;
    const mediaElement = this.getCurrentMediaElement();

    if (this.isMediaPlaying(video)) {
      video.pause();
    }

    if (this.isMediaPlaying(audio)) {
      audio.pause();
    }

    if (mediaElement) {
      mediaElement.pause();
      mediaElement.currentTime = 0;
    }
    this.isPlaying = false;
    this.currentTime = 0;
    this.trackPosition = 0;
  }

  seek(event: MouseEvent) {
    const mediaElement = this.getCurrentMediaElement();
    if (!mediaElement || this.duration <= 0) return;

    const progressBar = event.currentTarget as HTMLElement;
    const clickPosition = event.offsetX;
    const width = progressBar.clientWidth;
    const percentage = clickPosition / width;

    mediaElement.currentTime = percentage * this.duration;
  }

  adjustVolume(event: MouseEvent) {
    const mediaElement = this.getCurrentMediaElement();
    if (!mediaElement) return;

    const volumeBar = event.currentTarget as HTMLElement;
    const clickPosition = event.offsetX;
    const width = volumeBar.clientWidth;
    this.volume = Math.max(0, Math.min(1, clickPosition / width));

    mediaElement.volume = this.volume;
    this.volumePosition = this.volume * 100;
  }

  toggleMute() {
    const mediaElement = this.getCurrentMediaElement();
    if (!mediaElement) return;

    this.isMuted = !this.isMuted;
    mediaElement.muted = this.isMuted;
  }

  nextTrack() {
    if (this.playlist.length === 0) return;

    this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
    this.loadMedia();

    if (this.isPlaying) {
      setTimeout(() => this.togglePlayPause(), 100); // Small delay to ensure media is loaded
    }
  }

  prevTrack() {
    if (this.playlist.length === 0) return;

    this.currentTrack =
      (this.currentTrack - 1 + this.playlist.length) % this.playlist.length;
    this.loadMedia();

    if (this.isPlaying) {
      setTimeout(() => this.togglePlayPause(), 100); // Small delay to ensure media is loaded
    }
  }

  getTrack(index: number): MediaFile | null {
    return this.playlist[index] ?? null;
  }

  selectTrack(index: number) {
    if (index >= 0 && index < this.playlist.length) {
      this.currentTrack = index;
      this.loadMedia();

      if (this.isPlaying) {
        setTimeout(() => this.togglePlayPause(), 100); // Small delay to ensure media is loaded
      }
    }
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

}
