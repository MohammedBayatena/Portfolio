import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, ViewChild,} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BehaviorSubject, Observable} from 'rxjs';
import {ToolbarModel} from '../../models/window-toolbar.model';
import {Win98ToolbarComponent} from '../win98-window-toolbar.component.ts/win98-window-toolbar.component';
import {FileConverterDownloaderHelper} from '../../utils/file-converter-downloader.service';
import {DialogService} from '../../services/dialog.service';
import {ToolbarBuilder} from '../../utils/toolbar-builder';
import {FilenamePipe} from '../../pipes/filename.pipe';

@Component({
  selector: 'app-win98-image-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, Win98ToolbarComponent, NgOptimizedImage, FilenamePipe],
  templateUrl: './win98-image-viewer.component.html',
  styleUrls: ['./win98-image-viewer.component.scss'],
})
export class Win98ImageViewerComponent implements AfterViewInit {
  @Input() images: string[] = [];
  @Input() initialIndex: number = 0;
  @Input() windowClose: () => void = () => {
  };

  @ViewChild('imageContainer') imageContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;

  constructor(
    private cdr: ChangeDetectorRef,
    private dialogService: DialogService,
  ) {
  }


  toolbarModel: ToolbarModel = new ToolbarBuilder()
    .AddDropdown('file', 'File')
    .AddDropDownItem({id: 'open', label: 'Open...', shortcut: 'Ctrl+O', action: () => this.handleOpen()})
    .AddDropDownItem({id: 'saveAs', label: 'Save As...', action: async () => await this.handleSaveAs()})
    .AddDivider()
    .AddDropDownItem({id: 'print', label: 'Print...', shortcut: 'Ctrl+P', action: () => this.handlePrint()})
    .AddDivider()
    .AddDropDownItem({id: 'exit', label: 'Exit', action: () => this.handleExit()})
    .AddDropdown('view', 'View')
    .AddDropDownItem({id: 'zoomIn', label: 'Zoom In', shortcut: 'Ctrl++', action: () => this.handleZoomIn()})
    .AddDropDownItem({id: 'zoomOut', label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => this.handleZoomOut()})
    .AddDropDownItem({
      id: 'actualSize',
      label: 'Actual Size',
      shortcut: 'Ctrl+0',
      action: () => this.handleActualSize()
    })
    .AddDropDownItem({id: 'fitToWindow', label: 'Fit to Window', action: () => this.handleFitToWindow()})
    .AddDivider()
    .AddDropDownItem({
      id: 'rotateLeft',
      label: 'Rotate Left',
      shortcut: 'Ctrl+L',
      action: () => this.handleRotateLeft()
    })
    .AddDropDownItem({
      id: 'rotateRight',
      label: 'Rotate Right',
      shortcut: 'Ctrl+R',
      action: () => this.handleRotateRight()
    })
    .AddDropdown('help', 'Help')
    .AddDropDownItem({id: 'helpTopics', label: 'Help Topics', shortcut: 'F1', action: () => this.handleHelpTopics()})
    .AddDivider()
    .AddDropDownItem({id: 'about', label: 'About Image Viewer', action: () => this.handleAbout()})
    .GetToolbar();

  // Image state
  currentIndex: number = 0;
  zoomLevel: number = 100;
  rotation: number = 0;
  isDragging: boolean = false;
  dragStartX: number = 0;
  dragStartY: number = 0;
  translateX: number = 0;
  translateY: number = 0;

  private imageInfoSubject = new BehaviorSubject<string>('');
  imageInfo$: Observable<string> = this.imageInfoSubject.asObservable();

  // Windows 98 style properties
  zoomInput: string = '100';
  isLoading: boolean = true;
  error: string = '';

  ngAfterViewInit() {
    this.currentIndex = this.initialIndex;
    this.loadImage();
  }

  loadImage() {
    if (
      this.images.length === 0 ||
      this.currentIndex < 0 ||
      this.currentIndex >= this.images.length
    ) {
      this.error = 'No image to display';
      this.isLoading = false;
      this.updateImageInfo();
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.resetTransform();

    const img = new Image();
    img.onload = () => {
      this.isLoading = false;
      this.updateImageInfo();
      this.cdr.detectChanges();
    };
    img.onerror = () => {
      this.isLoading = false;
      this.updateImageInfo();
      this.error = 'Failed to load image';
    };
    img.src = this.images[this.currentIndex];
  }

  centerImage() {
    if (!this.imageContainer || !this.imageElement) return;

    const containerRect =
      this.imageContainer.nativeElement.getBoundingClientRect();
    const imgRect = this.imageElement.nativeElement.getBoundingClientRect();

    // Center the image in the container
    this.translateX = (containerRect.width - imgRect.width) / 2;
    this.translateY = (containerRect.height - imgRect.height) / 2;

    this.updateTransform();
  }

  resetTransform() {
    this.zoomLevel = 100;
    this.rotation = 0;
    this.translateX = 0;
    this.translateY = 0;
    this.zoomInput = '100';
    this.updateTransform();
  }

  updateTransform() {
    if (!this.imageElement) return;

    this.imageElement.nativeElement.style.transform = `
      translate(${this.translateX}px, ${this.translateY}px)
      scale(${this.zoomLevel / 100})
      rotate(${this.rotation}deg)
    `;
  }

  applyZoom() {
    const zoom = parseInt(this.zoomInput);
    if (!isNaN(zoom) && zoom >= 10 && zoom <= 1000) {
      this.zoomLevel = zoom;
      this.updateTransform();
    } else {
      this.zoomInput = this.zoomLevel.toString();
    }
  }

  zoomIn() {
    if (this.zoomLevel < 1000) {
      this.zoomLevel += 25;
      this.zoomInput = this.zoomLevel.toString();
      this.updateTransform();
    }
  }

  zoomOut() {
    if (this.zoomLevel > 10) {
      this.zoomLevel -= 25;
      this.zoomInput = this.zoomLevel.toString();
      this.updateTransform();
    }
  }

  rotateLeft() {
    this.rotation = (this.rotation - 90) % 360;
    this.updateTransform();
  }

  rotateRight() {
    this.rotation = (this.rotation + 90) % 360;
    this.updateTransform();
  }

  fitToWindow() {
    if (!this.imageContainer || !this.imageElement) return;

    const containerRect =
      this.imageContainer.nativeElement.getBoundingClientRect();
    const imgWidth = this.imageElement.nativeElement.naturalWidth;
    const imgHeight = this.imageElement.nativeElement.naturalHeight;

    // Calculate zoom to fit image in container
    const scaleX = containerRect.width / imgWidth;
    const scaleY = containerRect.height / imgHeight;
    const scale = Math.min(scaleX, scaleY) * 100;

    this.zoomLevel = Math.min(scale, 100); // Don't zoom in beyond 100%
    this.zoomInput = Math.round(this.zoomLevel).toString();
    this.rotation = 0;
    this.centerImage();
  }

  actualSize() {
    this.resetTransform();
    this.centerImage();
  }

  startDrag(event: MouseEvent) {
    if (this.zoomLevel <= 100) return; // Only allow dragging when zoomed in

    this.isDragging = true;
    this.dragStartX = event.clientX - this.translateX;
    this.dragStartY = event.clientY - this.translateY;

    // Change cursor to grabbing
    document.body.style.cursor = 'grabbing';
    event.preventDefault();
  }

  drag(event: MouseEvent) {
    if (!this.isDragging) return;

    this.translateX = event.clientX - this.dragStartX;
    this.translateY = event.clientY - this.dragStartY;
    this.updateTransform();
  }

  endDrag() {
    this.isDragging = false;
    document.body.style.cursor = '';
  }

  nextImage() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.loadImage();
    }
  }

  prevImage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.loadImage();
    }
  }

  getImageName(): string {
    if (this.images.length === 0) return 'No Image';

    const src = this.images[this.currentIndex];
    const parts = src.split('/');
    return parts[parts.length - 1];
  }

  updateImageInfo() {
    if (!this.imageElement) {
      this.imageInfoSubject.next('');
      return;
    }

    const img = this.imageElement.nativeElement;
    if (!img.naturalWidth) {
      this.imageInfoSubject.next('');
      return;
    }

    const info = `${img.naturalWidth} × ${img.naturalHeight} pixels`;
    this.imageInfoSubject.next(info);
  }

  // Handle window resize to re-center image
  @HostListener('window:resize')
  onResize() {
    if (this.zoomLevel <= 100) {
      this.centerImage();
    }
  }

  //ToolBar Methods
  private handleOpen() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.images = [e.target?.result as string];
          this.currentIndex = 0;
          this.loadImage();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  private async handleSaveAs() {
    try {
      const blob = await FileConverterDownloaderHelper.convertImageElementToBlob(
        this.imageElement.nativeElement,
        {
          width: this.imageElement.nativeElement.naturalWidth,
          height: this.imageElement.nativeElement.naturalHeight,
          rotation: this.rotation,
          scale: this.zoomLevel
        })
      FileConverterDownloaderHelper.downloadBlopAsFile(blob, this.getImageName() || 'image.png')
    } catch (error) {
      this.alertError(`Image '${this.getImageName()}' could not be downloaded`);
    }
  }

  private alertError(message: string) {
    this.dialogService.showError("Image Viewer", message);
  }

  private handlePrint() {
    window.print();
  }

  private handleExit() {
    this.windowClose();
  }

  private handleZoomIn() {
    this.zoomIn();
  }

  private handleZoomOut() {
    this.zoomOut();
  }

  private handleActualSize() {
    this.actualSize();
  }

  private handleFitToWindow() {
    this.fitToWindow();
  }

  private handleRotateLeft() {
    this.rotateLeft();
  }

  private handleRotateRight() {
    this.rotateRight();
  }

  private handleHelpTopics() {
    this.dialogService.showInformation(
      'Help Topics',
      'Help Topics would open here'
    );
  }

  private handleAbout() {
    this.dialogService.showInformation(
      'About Notepad',
      'Image Viewer\n\nVersion 1.0\n\n© 1998 Windows 98 Image Viewer'
    );
  }

}
