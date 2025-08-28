export interface ImageExportSettingsModel {
  scale: number;
  height: number;
  width: number;
  rotation: number;
}

export class FileConverterDownloaderHelper {

  static convertImageElementToBlob(
    image: HTMLImageElement,
    settings: ImageExportSettingsModel): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    if (!ctx) {
      throw new Error('Unable to get 2D rendering context.');
    }

    canvas.width = settings.width;
    canvas.height = settings.height;

    // Apply current transformations (zoom and rotation) if needed
    ctx.save();

    // Move to center for rotation
    ctx.translate(settings.width / 2, settings.height / 2);
    ctx.rotate(settings.rotation * Math.PI / 180);
    // Draw the image centered
    ctx.drawImage(image, -settings.width / 2, -settings.height / 2, settings.width, settings.height);

    ctx.restore();

    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to Blob.'));
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  static convertStringToTextBlob(text: string): Blob {
    return new Blob([text], {type: 'text/plain'});
  }

  static convertPdfToBlob(pdfSourceUrl: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      fetch(pdfSourceUrl)
        .then(response => {
          if (!response.ok) {
            reject(new Error('Failed to fetch PDF'));
          }
          resolve(response.blob());
        })
        .catch(error => {
          reject(new Error('Failed to convert PDF to Blob'));
        });
    });
  }

  static downloadBlopAsFile(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static getFilenameFromUrl(url: string, extension: string, defaultName: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.substring(pathname.lastIndexOf('/') + 1);

      // Check if it has a .pdf extension
      if (filename.toLowerCase().endsWith(extension)) {
        return filename;
      }
      return defaultName;
    } catch (e) {
      return defaultName;
    }
  }

}
