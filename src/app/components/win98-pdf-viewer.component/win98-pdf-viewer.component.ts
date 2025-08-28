import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, ViewChild,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SafePipe} from '../../pipes/safe.pipe';
import {ToolbarModel} from '../../models/window-toolbar.model';
import {Win98ToolbarComponent} from '../win98-window-toolbar.component.ts/win98-window-toolbar.component';
import {DialogService} from '../../services/dialog.service';
import {FileConverterDownloaderHelper} from '../../utils/file-converter-downloader.service';
import {ToolbarBuilder} from '../../utils/toolbar-builder';
import {FilenamePipe} from '../../pipes/filename.pipe';

@Component({
  selector: 'app-win98-pdf-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, SafePipe, Win98ToolbarComponent, FilenamePipe],
  templateUrl: './win98-pdf-viewer.component.html',
  styleUrls: ['./win98-pdf-viewer.component.scss'],
})
export class Win98PdfViewerComponent implements AfterViewInit {
  @Input() pdfSrc: string = '';
  @Input() windowClose: () => void = () => {
  };

  @ViewChild('pdfFrame') pdfFrame!: ElementRef<HTMLIFrameElement>;

  constructor(
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef) {
  }

  toolbarModel: ToolbarModel = new ToolbarBuilder()
    .AddDropdown('file', 'File')
    .AddDropDownItem({id: 'open', label: 'Open...', shortcut: 'Ctrl+O', action: () => this.handleOpenDocument()})
    .AddDropDownItem({id: 'saveAs', label: 'Save As...', action: async () => await this.handleSaveAs()})
    .AddDivider()
    .AddDropDownItem({id: 'print', label: 'Print...', shortcut: 'Ctrl+P', action: () => this.handlePrint()})
    .AddDivider()
    .AddDropDownItem({id: 'exit', label: 'Exit', action: () => this.handleExit()})
    .AddDropdown('help', 'Help')
    .AddDropDownItem({id: 'helpTopics', label: 'Help Topics', shortcut: 'F1', action: () => this.handleHelpTopics()})
    .AddDivider()
    .AddDropDownItem({id: 'about', label: 'About Image Viewer', action: () => this.handleAbout()})
    .GetToolbar()

  // PDF viewer state
  currentPage: number = 1;
  zoomLevel: number = 100;
  isLoading: boolean = true;
  error: string = '';
  pdfSafeUrl: string = '';

  ngAfterViewInit() {
    this.loadPdf();
  }

  loadPdf() {
    if (!this.pdfSrc) {
      this.error = 'No PDF source provided';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.error = '';

    // Set up iframe to load PDF
    if (this.pdfFrame) {
      this.pdfFrame.nativeElement.onload = () => {
        this.isLoading = false;
        this.currentPage = 1;
        this.cdr.detectChanges();
      };

      this.pdfFrame.nativeElement.onerror = () => {
        this.isLoading = false;
        this.error = 'Failed to load PDF';
        this.cdr.detectChanges();
      };

      // Load the PDF
      this.pdfSafeUrl = this.pdfSrc;
      this.cdr.detectChanges(); // Ensure the view updates with the new URL
    }
  }

  //Toolbar Actions
  private handleOpenDocument() {
    if (this.isLoading) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Create a blob URL for the file
          const blob = new Blob([e.target?.result as ArrayBuffer], {type: 'application/pdf'});
          // Update the PDF source
          this.pdfSrc = URL.createObjectURL(blob);
          this.loadPdf();
        };
        reader.onerror = () => {
          this.dialogService.showError("PDF Viewer", 'Failed to open PDF file')
        };
        reader.readAsArrayBuffer(file);
      }
    };
    input.click();
  }

  private async handleSaveAs() {
    if (this.isLoading) return;
    if (!this.pdfSrc) {
      this.dialogService.showError("PDF Viewer", "No PDF to save.");
      return;
    }

    try {
      const blop = await FileConverterDownloaderHelper.convertPdfToBlob(this.pdfSrc);
      const pdfName = FileConverterDownloaderHelper.getFilenameFromUrl(this.pdfSrc, '.pdf', 'document.pdf');
      FileConverterDownloaderHelper.downloadBlopAsFile(blop, pdfName);
    } catch (error) {
      this.dialogService.showError("PDF Viewer", "PDF could not be saved.");
    }
  }

  private handlePrint() {
    const iframeWindow = this.pdfFrame.nativeElement.contentWindow;
    if (iframeWindow) {
      iframeWindow.print();
    } else {
      this.dialogService.showError(
        "PDF Viewer",
        "Couldn't Print PDF"
      )
    }
  }

  private handleExit() {
    this.windowClose()
  }

  private handleHelpTopics() {
    this.dialogService.showInformation(
      "PDF Viewer",
      "Help Topics Goes Here",
    );
  }

  private handleAbout() {
    this.dialogService.showInformation(
      "PDF Viewer",
      "PDF Viewer\n\nVersion 6.0\n\n© 1998 Microsoft Corporation"
    );
  }

}
