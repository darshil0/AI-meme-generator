/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportService } from './export.service';

describe('ExportService', () => {
    let service: ExportService;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock ClipboardItem if it doesn't exist (JSDOM)
        if (typeof (globalThis as any).ClipboardItem === 'undefined') {
            (globalThis as any).ClipboardItem = class ClipboardItem {
                constructor(public data: any) { }
            };
        }

        service = new ExportService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have a default copy button text', () => {
        expect(service.copyButtonText()).toBe('Copy to Clipboard');
    });

    it('should trigger download flow', async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;

        // Mock URL.createObjectURL and URL.revokeObjectURL
        const mockUrl = 'blob:test';
        vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);
        vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => { });

        const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => { });

        await service.downloadMeme(canvas, 0.9);

        expect(clickSpy).toHaveBeenCalled();
        vi.restoreAllMocks();
    });

    it('should update button text on successful copy', async () => {
        // Mock navigator.clipboard
        const mockClipboard = {
            write: vi.fn().mockResolvedValue(undefined)
        };
        vi.stubGlobal('navigator', {
            ...navigator,
            clipboard: mockClipboard
        });

        // Mock canvas.toBlob
        const canvas = document.createElement('canvas');
        vi.spyOn(canvas, 'toBlob').mockImplementation((callback) => {
            if (callback) callback(new Blob(['test'], { type: 'image/png' }));
        });

        await service.copyToClipboard(canvas);

        expect(mockClipboard.write).toHaveBeenCalled();
        expect(service.copyButtonText()).toContain('Copied!');
    });
});
