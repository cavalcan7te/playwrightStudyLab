import { chromium } from '@playwright/test';

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://studylab.free.laravel.cloud/login');

  await page.getByRole('textbox', {
    name: 'nome@exemplo.com'
  }).fill('sospatinhas26@gmail.com');

  await page.getByRole('textbox', {
    name: '••••••••'
  }).fill('Si!12345678');

  await page.getByRole('button', {
    name: 'Entrar na plataforma'
  }).click();

  await page.waitForURL(/dashboard/, {
    timeout: 15000
  });

  await page.context().storageState({
    path: 'auth.json'
  });

  await browser.close();
}

export default globalSetup;