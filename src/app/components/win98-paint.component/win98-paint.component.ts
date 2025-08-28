import {Component, ViewChild, ElementRef, AfterViewInit, Input} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ToolbarModel} from '../../models/window-toolbar.model';
import {Win98ToolbarComponent} from '../win98-window-toolbar.component.ts/win98-window-toolbar.component';
import {DialogService} from '../../services/dialog.service';
import {ToolbarBuilder} from '../../utils/toolbar-builder';
import {take} from 'rxjs';

@Component({
  selector: 'app-win98-paint',
  standalone: true,
  imports: [CommonModule, FormsModule, Win98ToolbarComponent, NgOptimizedImage],
  templateUrl: './win98-paint.component.html',
  styleUrls: ['./win98-paint.component.scss']
})
export class Win98PaintComponent implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('colorPicker') colorPicker!: ElementRef<HTMLInputElement>;
  @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;

  // Paint settings
  @Input() title: string = 'Untitled - Paint';
  @Input() windowClose: () => void = () => {
  };


  constructor(private dialogService: DialogService) {
  }

  // Canvas context
  private ctx!: CanvasRenderingContext2D;
  private tempCanvas!: HTMLCanvasElement;
  private tempCtx!: CanvasRenderingContext2D;

  // Drawing state
  isDrawing: boolean = false;
  currentTool: string = 'pencil';
  currentColor: string = '#000000';
  lineWidth: number = 1;
  startX: number = 0;
  startY: number = 0;

  // Toolbar model

  toolbarModel: ToolbarModel = new ToolbarBuilder()
    .AddDropdown('file', 'File')
    .AddDropDownItem({id: 'new', label: 'New', shortcut: 'Ctrl+N', action: () => this.handleNewPainting()})
    .AddDropDownItem({id: 'open', label: 'Open...', shortcut: 'Ctrl+O', action: () => this.handleOpen()})
    .AddDropDownItem({id: 'save', label: 'Save', shortcut: 'Ctrl+S', action: () => this.handleSave()})
    .AddDropDownItem({id: 'saveAs', label: 'Save As...', action: () => this.handleSaveAs()})
    .AddDivider()
    .AddDropDownItem({id: 'print', label: 'Print...', shortcut: 'Ctrl+P', action: () => this.handlePrint()})
    .AddDivider()
    .AddDropDownItem({id: 'exit', label: 'Exit', action: () => this.handleExit()})
    .AddDropdown('edit', 'Edit')
    .AddDropDownItem({id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', action: () => this.handleUndo()})
    .AddDropDownItem({id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y', action: () => this.handleRedo()})
    .AddDivider()
    .AddDropDownItem({id: 'clear', label: 'Clear', action: () => this.handleClear()})
    .AddDropdown('view', 'View')
    .AddDropDownItem({id: 'zoomIn', label: 'Zoom In', shortcut: 'Ctrl++', action: () => this.handleZoomIn()})
    .AddDropDownItem({id: 'zoomOut', label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => this.handleZoomOut()})
    .AddDropDownItem({id: 'normalSize', label: 'Normal Size', action: () => this.handleNormalSize()})
    .AddDropdown('help', 'Help')
    .AddDropDownItem({id: 'helpTopics', label: 'Help Topics', shortcut: 'F1', action: () => this.handleHelpTopics()})
    .AddDivider()
    .AddDropDownItem({id: 'about', label: 'About Paint', action: () => this.handleAbout()})
    .GetToolbar()

  // Color palette (Windows 98 colors)
  colorPalette = [
    '#000000', '#800000', '#008000', '#808000',
    '#000080', '#800080', '#008080', '#C0C0C0',
    '#808080', '#FF0000', '#00FF00', '#FFFF00',
    '#0000FF', '#FF00FF', '#00FFFF', '#FFFFFF'
  ];

  // Zoom state
  zoomLevel: number = 1;
  minZoom = 0.5;
  maxZoom = 3;
  scaleStep = .25;


  // History for undo/redo
  private history: ImageData[] = [];
  private historyStep: number = -1;

  //Image Data
  private imageData!: ImageData

  ngAfterViewInit() {
    this.initCanvas();
    this.saveState();
  }

  // Mouse events
  onMouseDown(event: MouseEvent) {
    this.isDrawing = true;

    const {x, y} = this.getTransformedMousePos(event);

    this.startX = x;
    this.startY = y;

    if (this.currentTool === 'pencil' || this.currentTool === 'eraser') {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
    } else if (this.currentTool === 'rectangle' || this.currentTool === 'circle' || this.currentTool === 'line') {
      // For shapes, we'll draw on the temporary canvas first
      this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
      this.tempCtx.drawImage(this.canvas.nativeElement, 0, 0);
    }
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDrawing) return;

    // const rect = this.canvas.nativeElement.getBoundingClientRect();

    const {x, y} = this.getTransformedMousePos(event);

    if (this.currentTool === 'pencil') {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    } else if (this.currentTool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = 20;
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      this.ctx.lineWidth = this.lineWidth
    } else if (this.currentTool === 'rectangle') {
      this.drawRectangle(x, y);
    } else if (this.currentTool === 'circle') {
      this.drawCircle(x, y);
    } else if (this.currentTool === 'line') {
      this.drawLine(x, y);
    }
  }

  onMouseUp() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.saveState();
  }

  //Window Events
  onResize() {
    const canvas = this.canvas.nativeElement;
    canvas.width = this.canvasContainer.nativeElement.offsetWidth;
    canvas.height = this.canvasContainer.nativeElement.offsetHeight;
  }

  // Tool selection
  selectTool(tool: string) {
    this.currentTool = tool;

    if (tool === 'pencil') {
      this.canvas.nativeElement.style.cursor = 'url("/assets/icons/cursors/pencil-cursor.svg") 0 32, auto';
    } else if (tool === 'eraser') {
      this.canvas.nativeElement.style.cursor = 'url("/assets/icons/cursors/eraser-cursor.svg") 0 0, auto';
    } else {
      this.canvas.nativeElement.style.cursor = 'crosshair';
    }
  }

  // Color selection
  selectColor(color: string) {
    this.currentColor = color;
    this.ctx.strokeStyle = color;
  }

  // Line width
  setLineWidth(width: number) {
    this.lineWidth = width;
    this.ctx.lineWidth = width;
  }

  // File menu actions
  handleNewPainting() {
    this.dialogService.showConfirmation(
      'Paint',
      'Create a new image? Unsaved changes will be lost.',
      'Yes',
      'No'
    )
      .pipe(take(1))
      .subscribe(result => {
        if (result.confirmed) {
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
          this.saveState();
        }
      });
  }

  handleOpen() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            this.clearCanvas()
            this.ctx.drawImage(img, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
            this.saveState();
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  handleSave() {
    const link = document.createElement('a');
    link.download = 'paint-image.png';
    link.href = this.canvas.nativeElement.toDataURL();
    link.click();
  }

  handleSaveAs() {
    this.handleSave();
  }

  handlePrint() {
    window.print();
  }

  handleExit() {
    this.dialogService.showConfirmation(
      'Paint',
      'Close Paint? Unsaved changes will be lost.',
      'Yes',
      'No'
    )
      .pipe(take(1))
      .subscribe(result => {
        if (result.confirmed) {
          this.windowClose();
        }
      });
  }

  // Edit menu actions
  handleUndo() {
    if (this.historyStep > 0) {
      this.historyStep--;
      this.ctx.putImageData(this.history[this.historyStep], 0, 0);
    }
  }

  handleRedo() {
    if (this.historyStep < this.history.length - 1) {
      this.historyStep++;
      this.ctx.putImageData(this.history[this.historyStep], 0, 0);
    }
  }

  handleClear() {

    this.dialogService.showConfirmation(
      'Paint',
      'Clear the canvas?',
      'Yes',
      'No'
    )
      .pipe(take(1))
      .subscribe(result => {
        if (result.confirmed) {
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
          this.saveState();
        }
      });
  }

  // View menu actions
  handleZoomIn() {
    this.zoomLevel = Math.min(this.zoomLevel + this.scaleStep, this.maxZoom);
    this.redrawCanvas();
  }

  handleZoomOut() {
    this.zoomLevel = Math.max(this.zoomLevel - this.scaleStep, this.minZoom);
    this.redrawCanvas();
  }

  handleNormalSize() {
    this.zoomLevel = 1;
    this.redrawCanvas();
  }

  // Help menu actions
  handleHelpTopics() {
    this.dialogService.showInformation(
      'Help Topics',
      'Help Topics would open here'
    );
  }

  handleAbout() {
    this.dialogService.showInformation(
      'About Paint',
      'Paint\n\nVersion 1.0\n\n© 1998 Windows 98 Paint'
    );
  }

  private initCanvas() {
    const canvas = this.canvas.nativeElement;
    this.ctx = canvas.getContext('2d', {willReadFrequently: true})!;

    // Set canvas size
    canvas.width = this.canvasContainer.nativeElement.offsetWidth * .85; // 85% of Parent Container
    canvas.height = this.canvasContainer.nativeElement.offsetHeight * .85; // 85% of Parent Container
    this.canvas.nativeElement.style.cursor = 'url("/assets/icons/cursors/pencil-cursor.svg") 0 32, auto';


    // Create temporary canvas for shape drawing
    this.tempCanvas = document.createElement('canvas');
    this.tempCanvas.width = canvas.width;
    this.tempCanvas.height = canvas.height;
    this.tempCtx = this.tempCanvas.getContext('2d')!;


    // Set default styles
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.lineWidth;


    // Fill with white background
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Save state for undo/redo
  private saveState() {
    this.historyStep++;
    if (this.historyStep < this.history.length) {
      this.history.length = this.historyStep;
    }
    this.captureImageData()
    this.history.push(this.imageData);
  }

  private applyZoom() {
    const canvas = this.canvas.nativeElement;
    // Apply zoom (scale) and keep it centered
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    this.ctx.translate(centerX, centerY);
    this.ctx.scale(this.zoomLevel, this.zoomLevel);
    this.ctx.translate(-centerX, -centerY);
  }

  private redrawCanvas() {
    // Save the current canvas content into the Temp Canvas
    this.tempCtx.putImageData(this.imageData, 0, 0);

    // Clear and apply zoom
    this.clearCanvas()
    this.applyZoom();

    // Redraw the content
    this.ctx.drawImage(this.tempCanvas, 0, 0);
  }

  // Shape drawing methods
  private drawRectangle(x: number, y: number) {
    // Clear the main canvas
    this.clearCanvas()

    // Draw the saved state from temp canvas
    this.ctx.drawImage(this.tempCanvas, 0, 0);

    // Draw the rectangle
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeRect(this.startX, this.startY, x - this.startX, y - this.startY);
  }

  private drawCircle(x: number, y: number) {
    // Clear the main canvas
    this.clearCanvas();

    // Draw the saved state from temp canvas
    this.ctx.drawImage(this.tempCanvas, 0, 0);

    const width = x - this.startX;
    const height = y - this.startY;

    // Calculate center of the ellipse based on bounding box
    const centerX = this.startX + width / 2;
    const centerY = this.startY + height / 2;

    // Draw ellipse (circle that follows cursor exactly)
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.beginPath();
    this.ctx.ellipse(
      centerX,
      centerY,
      Math.abs(width / 2),
      Math.abs(height / 2),
      0,
      0,
      2 * Math.PI
    );
    this.ctx.stroke();
  }

  private drawLine(x: number, y: number) {
    // Clear the main canvas
    this.clearCanvas()

    // Draw the saved state from temp canvas
    this.ctx.drawImage(this.tempCanvas, 0, 0);

    // Draw the line
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(this.startX, this.startY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  private clearCanvas() {
    // Clear canvas
    this.ctx.reset()
  }

  private captureImageData() {
    // Capture untransformed Image Data
    this.imageData = this.ctx.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  private getTransformedMousePos(event: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const rawX = event.clientX - rect.left;
    const rawY = event.clientY - rect.top;
    const centerX = this.canvas.nativeElement.width / 2;
    const centerY = this.canvas.nativeElement.height / 2;
    const scale = this.zoomLevel;

    // Apply inverse transform
    const x = (rawX - centerX) / scale + centerX;
    const y = (rawY - centerY) / scale + centerY;

    return {x, y};
  }

  protected readonly Math = Math;
}
