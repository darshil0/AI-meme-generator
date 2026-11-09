import { ImageFilter, IMAGE_FILTER_CSS_MAP, TextLayer } from '../models/meme.model';

/** Canvas rendering, CSS filter, and export helpers for meme generation. */
export class CanvasUtils {
  static getLayerTextShadow(layer: TextLayer): string {
    const color = layer.outlineColor;
    const width = Math.max(1, Math.round(layer.fontSize / 24));
    return [
      `-${width}px -${width}px 0 ${color}`,
      `${width}px -${width}px 0 ${color}`,
      `-${width}px ${width}px 0 ${color}`,
      `${width}px ${width}px 0 ${color}`,
      `0 0 ${width * 2}px rgba(0,0,0,0.5)`,
    ].join(', ');
  }

  static getLayerTextFilter(layer: TextLayer): string {
    return layer.textBlur > 0 ? `blur(${layer.textBlur}px)` : 'none';
  }

  /** Renders the image and text layers to a full-resolution canvas. */
  static async generateMemeCanvas(
    imageSrc: string,
    layers: TextLayer[],
    imageFilter: ImageFilter,
  ): Promise<HTMLCanvasElement | null> {
    if (!imageSrc) return null;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx || !img.naturalWidth || !img.naturalHeight) {
          resolve(null);
          return;
        }

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.filter = IMAGE_FILTER_CSS_MAP[imageFilter] || IMAGE_FILTER_CSS_MAP[ImageFilter.NONE];
        ctx.drawImage(img, 0, 0);
        ctx.filter = 'none';
        ctx.imageSmoothingEnabled = true;

        for (const layer of layers) {
          ctx.save();
          ctx.textAlign = layer.textAlign ?? 'center';
          ctx.textBaseline = 'middle';
          ctx.filter = this.getLayerTextFilter(layer);
          ctx.font = `${layer.fontWeight ?? 'normal'} ${layer.fontSize}px Anton, Impact, sans-serif`;
          ctx.strokeStyle = layer.outlineColor;
          ctx.lineWidth = Math.max(2, Math.round(layer.fontSize / 20));
          ctx.fillStyle = layer.fontColor;

          const x = layer.textAlign === 'left' ? 0 : layer.textAlign === 'right' ? canvas.width : canvas.width / 2;
          const y = (layer.top / 100) * canvas.height;
          const rotation = ((layer.rotation ?? 0) * Math.PI) / 180;
          ctx.translate(x, y);
          if (rotation) ctx.rotate(rotation);
          const maxWidth = layer.maxWidth && layer.maxWidth > 0 ? layer.maxWidth : canvas.width;
          ctx.strokeText(layer.text, 0, 0, maxWidth);
          ctx.fillText(layer.text, 0, 0, maxWidth);
          ctx.restore();
        }

        resolve(canvas);
      };
      img.onerror = (error) => {
        console.error('CanvasUtils: Image load failed', error);
        resolve(null);
      };
      img.src = imageSrc;
    });
  }

  static canvasToDataUrl(canvas: HTMLCanvasElement, quality = 0.92): string {
    return canvas.toDataURL('image/jpeg', Math.min(1, Math.max(0, quality)));
  }

  static canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob(resolve, type));
  }
}
