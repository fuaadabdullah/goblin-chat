const { test, expect } = require('@playwright/test');

// Canned SSE stream the mocked API returns for every chat request.
const MOCK_STREAM = [
  'data: {"choices":[{"delta":{"content":"Hello "}}]}',
  '',
  'data: {"choices":[{"delta":{"content":"world! Here is some code:"}}]}',
  '',
  'data: {"choices":[{"delta":{"content":"\\n```js\\nconsole.log(1);\\n```"}}]}',
  '',
  'data: [DONE]',
  '',
].join('\n');

test.beforeEach(async ({ page }) => {
  // Point the app at a fake local API and mock the chat endpoint.
  await page.addInitScript(() => {
    localStorage.setItem('goblin-chat-settings', JSON.stringify({
      baseUrl: 'http://localhost:11434/v1',
      apiKey: '',
      model: 'test-model',
      system: 'You are a test assistant.',
    }));
  });
  await page.route('**/chat/completions', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: MOCK_STREAM,
    });
  });
  await page.goto('/');
});

test('page loads with empty state', async ({ page }) => {
  await expect(page.locator('header h1')).toContainText('Goblin Chat');
  await expect(page.locator('#empty-state')).toBeVisible();
  await expect(page.locator('#input')).toBeEnabled();
});

test('sending a message renders the streamed reply', async ({ page }) => {
  await page.locator('#input').fill('hi there');
  await page.locator('#send-btn').click();

  const userMsg = page.locator('.msg.user').last();
  await expect(userMsg).toContainText('hi there');

  const assistantMsg = page.locator('.msg.assistant').last();
  await expect(assistantMsg).toContainText('Hello world! Here is some code:', { timeout: 10000 });

  // Markdown code block rendered with a copy button
  await expect(assistantMsg.locator('pre code')).toContainText('console.log(1);');
  await expect(assistantMsg.locator('.copy-btn').first()).toBeVisible();
});

test('settings modal opens, saves, and persists', async ({ page }) => {
  await page.locator('#settings-btn').click();
  await expect(page.locator('#settings-modal')).toHaveClass(/open/);

  await page.locator('#set-model').fill('my-model');
  await page.locator('#settings-save').click();

  await expect(page.locator('#settings-modal')).not.toHaveClass(/open/);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('goblin-chat-settings'))
  );
  expect(saved.model).toBe('my-model');
});

test('new chat button clears the conversation', async ({ page }) => {
  await page.locator('#input').fill('hello');
  await page.locator('#send-btn').click();
  await expect(page.locator('.msg.assistant').last()).toContainText('Hello world!', { timeout: 10000 });

  await page.locator('#new-chat-btn').click();
  await expect(page.locator('.msg')).toHaveCount(0);
  await expect(page.locator('#empty-state')).toBeVisible();
});

test('API error shows a friendly message', async ({ page }) => {
  await page.unroute('**/chat/completions');
  await page.route('**/chat/completions', async (route) => {
    await route.fulfill({ status: 500, body: 'boom' });
  });

  await page.locator('#input').fill('this will fail');
  await page.locator('#send-btn').click();

  const assistantMsg = page.locator('.msg.assistant').last();
  await expect(assistantMsg).toContainText('API error 500', { timeout: 10000 });
});
