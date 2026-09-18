import { Injectable, signal } from '@angular/core';

/**
 * Service responsible for meme export operations including image file downloads
 * and clipboard copying.
 */
@Injectable({
  providedIn: 'root',
})
export class ExportService {
  /** Signal holding the current clipboard copy button status text */
  copyButtonText = signal('Copy to Clipboard');

  /**
   * Downloads the rendered meme canvas as a JPEG file with specified compression quality.
   * @param canvas The HTMLCanvasElement containing the rendered meme.
   * @param quality Quality ratio between 0.0 and 1.0.
   */
  async downloadMeme(canvas: HTMLCanvasElement, quality: number): Promise<void> {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const link = document.createElement('a');
    link.download = `ai-meme-${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();
  }

  /**
   * Copies the rendered meme canvas as a PNG blob directly to the user's system clipboard.
   * @param canvas The HTMLCanvasElement containing the rendered meme.
   * @returns Promise resolving to true if copy succeeded, false otherwise.
   */
  async copyToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
    try {
      return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve(false);
            return;
          }

          try {
            const data = [new ClipboardItem({ 'image/png': blob })];
            await navigator.clipboard.write(data);
            this.copyButtonText.set('Copied! ✅');
            setTimeout(() => this.copyButtonText.set('Copy to Clipboard'), 2000);
            resolve(true);
          } catch (err) {
            console.error('Clipboard error:', err);
            resolve(false);
          }
        }, 'image/png');
      });
    } catch (err) {
      console.error('Export error:', err);
      return false;
    }
  }
}
