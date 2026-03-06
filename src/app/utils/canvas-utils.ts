import { ImageFilter, IMAGE_FILTER_CSS_MAP, TextLayer } from '../models/meme.model';

/**
 * Utility for canvas-based meme rendering.
 */
export class CanvasUtils {
    /**
     * Calculates the text shadow style for an outline effect.
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
     * Gets the CSS filter string for a text layer.
     */
    static getLayerTextFilter(layer: TextLayer): string {
        return layer.textBlur > 0 ? `blur(${layer.textBlur}px)` : 'none';
    }

    /**
     * Generates a meme canvas from an image and text layers.
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
     * Converts a canvas to a data URL with specified quality.
     */
    static canvasToDataUrl(canvas: HTMLCanvasElement, quality: number = 0.92): string {
        return canvas.toDataURL('image/jpeg', quality);
    }

    /**
     * Converts a canvas to a Blob.
     */
    static canvasToBlob(canvas: HTMLCanvasElement, type: string = 'image/png'): Promise<Blob | null> {
        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), type);
        });
    }
}
