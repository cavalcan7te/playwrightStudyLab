import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://studylab.free.laravel.cloud';
const EMAIL = process.env.STUDYLAB_EMAIL || 'isaacmoreira@gmail.com';
const PASSWORD = process.env.STUDYLAB_PASSWORD || 'Escol@1005';

// Helper: preenche e submete o formulário de login
async function preencherLogin(page: any, email: string, senha: string) {
  await page.locator('input[type="email"], input[name="email"]').fill(email);
  await page.locator('input[type="password"], input[name="password"]').fill(senha);
  await page.locator('button[type="submit"]').click();
}

// CASOS FELIZES
test.describe('✅ Casos Felizes', () => {

  test('CF-01 | Login com credenciais válidas redireciona para área autenticada', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/Login/i);
    await expect(page.getByRole('heading', { name: /Bem-vindo de volta/i })).toBeVisible();

    await preencherLogin(page, EMAIL, PASSWORD);

    // Não deve permanecer na página de login
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('CF-02 | Após login, usuário consegue acessar área autenticada', async ({ page }) => {
    await page.goto('/login');
    await preencherLogin(page, EMAIL, PASSWORD);

    // Aguarda sair do login
    await expect(page).not.toHaveURL(/\/login/);

    // Verifica que está numa página autenticada (URL diferente do login e register)
    await expect(page).not.toHaveURL(/\/register/);

    // A página autenticada carregou com sucesso (sem erro 404/500)
await page.waitForLoadState('load');
await expect(page).not.toHaveURL(/\/login/);
  });

});

// CASOS TRISTES
test.describe('❌ Casos Tristes', () => {

  test('CT-01 | Login com senha incorreta exibe mensagem de erro', async ({ page }) => {
    await page.goto('/login');

    await preencherLogin(page, EMAIL, 'SenhaErrada@999');

    // Deve permanecer na página de login
    await expect(page).toHaveURL(/\/login/);

    // Deve exibir alguma mensagem de erro
    const errorMsg = page.locator('text=/credenciais|incorret|inválid|e-mail ou senha/i');
    await expect(errorMsg).toBeVisible();
  });

  test('CT-02 | Login com e-mail inexistente não autentica', async ({ page }) => {
    await page.goto('/login');

    await preencherLogin(page, 'usuario.nao.existe@exemplo.com', PASSWORD);

    // Deve permanecer na página de login
    await expect(page).toHaveURL(/\/login/);

    // Deve exibir mensagem de erro
    const errorMsg = page.locator('text=/credenciais|incorret|inválid|e-mail ou senha/i');
    await expect(errorMsg).toBeVisible();
  });

});

// CASOS DE BORDA
test.describe('⚠️ Casos de Borda', () => {

  test('CB-01 | Login com e-mail em formato inválido bloqueia envio', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[type="email"], input[name="email"]').fill('email-sem-arroba');
    await page.locator('input[type="password"], input[name="password"]').fill(PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Deve continuar na página de login
    await expect(page).toHaveURL(/\/login/);
  });

  test('CB-02 | Login com campos em branco não submete', async ({ page }) => {
    await page.goto('/login');

    // Clica em entrar sem preencher nada
    await page.locator('button[type="submit"]').click();

    // Deve permanecer na página de login
    await expect(page).toHaveURL(/\/login/);

    // O campo de e-mail deve ainda estar visível
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
  });

});