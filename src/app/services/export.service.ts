import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  copyButtonText = signal('Copy to Clipboard');

  async downloadMeme(canvas: HTMLCanvasElement, quality: number): Promise<void> {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const link = document.createElement('a');
    link.download = `ai-meme-${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();
  }

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
