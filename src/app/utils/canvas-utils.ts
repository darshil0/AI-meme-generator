import { ImageFilter, IMAGE_FILTER_CSS_MAP, TextLayer } from '../models/meme.model';

/**
 * Utility class providing canvas rendering operations, CSS filter handling,
 * and export conversions for meme generation.
 */
export class CanvasUtils {
  /**
   * Calculates the CSS text shadow value required for layer outline effects.
   * @param layer The text layer configuration.
   * @returns CSS text-shadow string.
   */
  static getLayerTextShadow(layer: TextLayer): string {
    const color = layer.outlineColor;
    const width = Math.max(1, Math.round(layer.fontSize / 24));
    const shadows = [
      `-${width}px -${width}px 0 ${color}`,
      `${width}px -${width}px 0 ${color}`,
      `-${width}px ${width}px 0 ${color}`,
      `${width}px ${width}px 0 ${color}`,
      `0 0 ${width * 2}px rgba(0,0,0,0.5)`,
    ];
    return shadows.join(', ');
  }

  /**
   * Calculates the CSS filter string for a text layer glow/blur effect.
   * @param layer The text layer configuration.
   * @returns CSS filter rule string.
   */
  static getLayerTextFilter(layer: TextLayer): string {
    return layer.textBlur > 0 ? `blur(${layer.textBlur}px)` : 'none';
  }

  /**
   * Renders a high-resolution canvas element combining the base image, applied filters,
   * and centered text layers.
   * @param imageSrc Base image source URL or data URL.
   * @param layers Array of text layer configurations to render.
   * @param imageFilter Active image filter selection.
   * @returns Promise resolving to the HTMLCanvasElement or null on error.
   */
  static async generateMemeCanvas(
    imageSrc: string,
    layers: TextLayer[],
    imageFilter: ImageFilter,
  ): Promise<HTMLCanvasElement | null> {
    if (!imageSrc) return null;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Apply image filter
        const filterCss =
          IMAGE_FILTER_CSS_MAP[imageFilter] || IMAGE_FILTER_CSS_MAP[ImageFilter.NONE];
        ctx.filter = filterCss;
        ctx.drawImage(img, 0, 0);
        ctx.filter = 'none';

        // Draw text layers (back to front)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.imageSmoothingEnabled = true;

        for (const layer of layers) {
          const lineWidth = Math.max(2, Math.round(layer.fontSize / 20));

          // Shadow for outline effect
          ctx.save();
          ctx.filter = this.getLayerTextFilter(layer);

          ctx.font = `${layer.fontSize}px Anton, Impact, sans-serif`;
          ctx.strokeStyle = layer.outlineColor;
          ctx.lineWidth = lineWidth;
          ctx.fillStyle = layer.fontColor;

          const y = (layer.top / 100) * canvas.height;
          ctx.strokeText(layer.text, canvas.width / 2, y);
          ctx.fillText(layer.text, canvas.width / 2, y);

          ctx.restore();
        }

        resolve(canvas);
      };

      img.onerror = (e) => {
        console.error('CanvasUtils: Image load failed', e);
        resolve(null);
      };
    });
  }

  /**
   * Converts an HTML canvas element to a JPEG data URL string.
   * @param canvas The rendered HTMLCanvasElement.
   * @param quality Quality ratio between 0.0 and 1.0 (defaults to 0.92).
   * @returns Base64 data URL string.
   */
  static canvasToDataUrl(canvas: HTMLCanvasElement, quality: number = 0.92): string {
    return canvas.toDataURL('image/jpeg', quality);
  }

  /**
   * Converts an HTML canvas element to a Blob.
   * @param canvas The rendered HTMLCanvasElement.
   * @param type Output MIME type (defaults to 'image/png').
   * @returns Promise resolving to a Blob or null.
   */
  static canvasToBlob(canvas: HTMLCanvasElement, type: string = 'image/png'): Promise<Blob | null> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), type);
    });
  }
}
