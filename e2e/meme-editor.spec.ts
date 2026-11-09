import { expect, test, type Page } from '@playwright/test';

const PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l3sAAAAASUVORK5CYII=',
  'base64',
);

async function mockBackend(page: Page): Promise<void> {
  await page.route('**/api/config-status', (route) =>
    route.fulfill({ json: { configured: true } }),
  );
  await page.route('**/api/generate-captions-from-image', (route) =>
    route.fulfill({
      json: {
        captions: ['When the test passes'],
        tone: 'humorous',
        success: true,
      },
    }),
  );
  await page.route('**/api/generate-captions-from-text', (route) =>
    route.fulfill({
      json: {
        captions: ['Doge approves this test'],
        tone: 'humorous',
        success: true,
      },
    }),
  );
}

async function uploadImage(page: Page): Promise<void> {
  await page.locator('input[type="file"]').setInputFiles({
    name: 'test-image.png',
    mimeType: 'image/png',
    buffer: PNG_BUFFER,
  });
  await expect(page.getByRole('heading', { name: 'Canvas Preview' })).toBeVisible();
  await expect(page.locator('img[alt="Meme preview"]')).toBeVisible();
  await expect(page.getByRole('button', { name: /TOP TEXT/ })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await mockBackend(page);
});

test('loads the editor landing page and template picker', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /AI Meme Generator/ }).first()).toBeVisible();
  await expect(page.getByText('Select a Template')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Select template: Doge' })).toBeVisible();
});

test('uploads an image, adds a layer, edits text, and applies a filter', async ({ page }) => {
  await page.goto('/');
  await uploadImage(page);

  await page.getByRole('button', { name: 'Add Text Layer' }).click();
  const layerText = page.locator('app-layer-controls input[type="text"]');
  await expect(layerText).toBeVisible();
  await layerText.fill('Playwright checked');
  await expect(layerText).toHaveValue('Playwright checked');

  await page.getByRole('button', { name: 'grayscale', exact: true }).click();
  await expect(page.locator('img[alt="Meme preview"]')).toHaveCSS('filter', 'grayscale(1)');
});

test('generates image captions and applies a suggestion to a text layer', async ({ page }) => {
  await page.goto('/');
  await uploadImage(page);

  await page.getByRole('button', { name: 'Magic Captions' }).click();
  const suggestion = page.getByRole('button', { name: '"When the test passes"' });
  await expect(suggestion).toBeVisible();
  await suggestion.click();
  await expect(page.locator('app-layer-controls input[type="text"]').first()).toHaveValue(
    'When the test passes',
  );
});

test('saves and restores edited work', async ({ page }) => {
  await page.goto('/');
  await uploadImage(page);

  const layerText = page.locator('app-layer-controls input[type="text"]');
  await layerText.fill('Saved from Playwright');
  await page.getByRole('button', { name: 'Save Work' }).click();
  await expect(page.getByRole('button', { name: /Saved!/ })).toBeVisible();

  await page.getByRole('button', { name: 'Start Over' }).click();
  await page.getByRole('button', { name: /Resume Work/ }).click();
  await expect(page.getByRole('heading', { name: 'Canvas Preview' })).toBeVisible();
  await expect(page.locator('app-layer-controls input[type="text"]').first()).toHaveValue(
    'Saved from Playwright',
  );
});

test('generates captions from a template name when its image cannot load', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Select template: Doge' }).click();
  await expect(page.getByRole('heading', { name: 'Canvas Preview' })).toBeVisible();

  await page.getByRole('button', { name: 'Magic Captions' }).click();
  await expect(page.getByRole('button', { name: '"Doge approves this test"' })).toBeVisible();
});
