import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('h1')).toBeVisible();
});

test('game page loads', async ({ page }) => {
  const response = await page.goto('http://localhost:5173/game');
  expect(response.status()).toBe(200);
});

test('leaderboard page loads', async ({ page }) => {
  const response = await page.goto('http://localhost:5173/leaderboard');
  expect(response.status()).toBe(200);
});

test('stats page loads', async ({ page }) => {
  const response = await page.goto('http://localhost:5173/stats');
  expect(response.status()).toBe(200);
});

test('knowledge page loads', async ({ page }) => {
  const response = await page.goto('http://localhost:5173/knowledge');
  expect(response.status()).toBe(200);
});

test('API is working', async ({ request }) => {
  const stats = await request.get('http://localhost:5000/api/stats');
  expect(stats.ok()).toBe(true);
  const data = await stats.json();
  expect(data.total_games).toBeDefined();
});
