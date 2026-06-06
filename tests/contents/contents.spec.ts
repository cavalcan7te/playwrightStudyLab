import { test, expect, Page } from '@playwright/test';

const EMAIL = process.env.STUDYLAB_EMAIL || 'isaacmoreira@gmail.com';
const PASSWORD = process.env.STUDYLAB_PASSWORD || 'Escol@1005';
const BASE_URL = 'https://studylab.free.laravel.cloud';

// ✅ Gerador de sufixo único só com letras
function sufixoUnico(tamanho = 8): string {
  const letras = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length: tamanho }, () =>
    letras[Math.floor(Math.random() * letras.length)]
  ).join('');
}

async function loginEIrParaConteudos(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole('textbox', { name: 'nome@exemplo.com' }).fill(EMAIL);
  await page.getByRole('textbox', { name: '••••••••' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Entrar na plataforma' }).click();

  await expect(page).toHaveURL(/.*dashboard/);

  await page.getByRole('link', { name: 'Matérias Matérias' }).click({ force: true });
  const linkConteudos = page.getByRole('link', { name: 'Ver conteúdos' }).first();
  await linkConteudos.waitFor({ state: 'visible' });
  await linkConteudos.click();

  await page.waitForURL('**/contents');
}

test.describe('Gerenciamento de Conteúdos', () => {

  test.beforeEach(async ({ page }) => {
    await loginEIrParaConteudos(page);
  });

  test.describe('✅ Casos Felizes', () => {
    test('CF-01 | Criar conteúdo com sucesso (Título Único)', async ({ page }) => {
      await page.getByRole('button', { name: 'Adicionar conteúdo' }).click();

      // ✅ Título único só com letras
      const tituloUnico = `Matematica ${sufixoUnico()}`;

      await page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' }).fill(tituloUnico);
      await page.locator('#modalContentSubject').selectOption({ index: 1 });
      await page.locator('#modalContentSemester').selectOption('1');
      await page.getByRole('button', { name: 'Salvar conteúdo' }).click();

      await expect(page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' })).not.toBeVisible();

      // ✅ Exibir todos os registros antes de verificar
      await page.locator('button[data-limit="999"]').click();

      await expect(page.locator('body')).toContainText(tituloUnico);
    });

    test('CF-02 | Editar o título de um conteúdo', async ({ page }) => {
      await page.getByRole('button', { name: 'Editar' }).first().click();

      // ✅ Título editado só com letras
      const tituloEditado = `Editado ${sufixoUnico()}`;
      await page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' }).fill(tituloEditado);
      await page.getByRole('button', { name: 'Salvar alterações' }).click();

      await expect(page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' })).not.toBeVisible();

      // ✅ Exibir todos os registros antes de verificar
      await page.locator('button[data-limit="999"]').click();

      await expect(page.locator('body')).toContainText(tituloEditado);
    });
  });

  test.describe('❌ Casos Tristes', () => {
    test('CT-01 | Salvar sem título', async ({ page }) => {
      await page.getByRole('button', { name: 'Adicionar conteúdo' }).click();
      await page.getByRole('button', { name: 'Salvar conteúdo' }).click();
      await expect(page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' })).toBeVisible();
    });

    test('CT-02 | Salvar sem selecionar matéria', async ({ page }) => {
      await page.getByRole('button', { name: 'Adicionar conteúdo' }).click();
      await page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' }).fill('Teste Erro');
      await page.getByRole('button', { name: 'Salvar conteúdo' }).click();
      await expect(page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' })).toBeVisible();
    });
  });

  test.describe('⚠️ Casos de Borda', () => {
    test('CB-01 | Título curto (1 char)', async ({ page }) => {
      await page.getByRole('button', { name: 'Adicionar conteúdo' }).click();
      // ✅ Char aleatório só com letras
      const charAleatorio = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      await page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' }).fill(charAleatorio);
      await page.locator('#modalContentSubject').selectOption({ index: 1 });
      await page.locator('#modalContentSemester').selectOption('1');
      await page.getByRole('button', { name: 'Salvar conteúdo' }).click();

      await expect(page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' })).not.toBeVisible();
    });

    test('CB-02 | Título longo (255 chars)', async ({ page }) => {
      await page.getByRole('button', { name: 'Adicionar conteúdo' }).click();
      // ✅ 255 chars só com letras (247 B's + 8 chars aleatórios)
      const longo = 'B'.repeat(247) + sufixoUnico(8);

      await page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' }).fill(longo);
      await page.locator('#modalContentSubject').selectOption({ index: 1 });
      await page.locator('#modalContentSemester').selectOption('1');

      await page.getByRole('button', { name: 'Salvar conteúdo' }).click();
      await expect(page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' })).not.toBeVisible();
    });
  });
});