import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',


  fullyParallel: false,

  // Evita commits com test.only
  forbidOnly: !!process.env.CI,

  // Retries
  retries: 0,

  // Evita conflitos entre testes
  workers: process.env.CI ? 1 : 1,

  // Relatório
  reporter: 'html',

  // Login automático
  globalSetup: './global-setup.ts',

  use: {
    // URL base do sistema
    baseURL: 'https://studylab.free.laravel.cloud',

    // Reutiliza sessão autenticada
    storageState: 'auth.json',

    // Timeout para ações
    actionTimeout: 10_000,

    // Timeout para navegação
    navigationTimeout: 15_000,

    // Coleta trace quando falhar
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //   },
    // },

    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //   },
    // },

    // Se quiser habilitar depois:

    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },

    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     ...devices['Desktop Edge'],
    //     channel: 'msedge',
    //   },
    // },

    // {
    //   name: 'Google Chrome',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     channel: 'chrome',
    //   },
    // },
  ],
});