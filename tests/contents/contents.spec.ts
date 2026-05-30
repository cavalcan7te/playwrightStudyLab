import { test, expect, Page } from '@playwright/test';

const EMAIL = process.env.STUDYLAB_EMAIL || 'isaacmoreira@gmail.com';
const PASSWORD = process.env.STUDYLAB_PASSWORD || 'Escol@1005';
const BASE_URL = 'https://studylab.free.laravel.cloud';

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
      
      // Criamos um nome único usando o timestamp atual para evitar o erro de "já registrado"
      const tituloUnico = `Matemática ${Date.now()}`; 
      
      await page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' }).fill(tituloUnico);
      await page.locator('#modalContentSubject').selectOption({ index: 1 });
      await page.locator('#modalContentSemester').selectOption('1');
      
      await page.getByRole('button', { name: 'Salvar conteúdo' }).click();

      // Agora o modal deve fechar porque o título não é repetido
      await expect(page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' })).not.toBeVisible();
      await expect(page.locator('body')).toContainText(tituloUnico);
    });

    test('CF-02 | Editar o título de um conteúdo', async ({ page }) => {
      await page.getByRole('button', { name: 'Editar' }).first().click();
      
      const tituloEditado = `Editado ${Date.now()}`;
      await page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' }).fill(tituloEditado);
      
      // Botão correto para o modal de edição
      await page.getByRole('button', { name: 'Salvar alterações' }).click();

      await expect(page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' })).not.toBeVisible();
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
      // Usamos um char aleatório para não repetir
      const charAleatorio = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      await page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' }).fill(charAleatorio);
      await page.locator('#modalContentSubject').selectOption({ index: 1 });
      await page.locator('#modalContentSemester').selectOption('1');
      await page.getByRole('button', { name: 'Salvar conteúdo' }).click();
      
      await expect(page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' })).not.toBeVisible();
    });

    test('CB-02 | Título longo (255 chars)', async ({ page }) => {
      await page.getByRole('button', { name: 'Adicionar conteúdo' }).click();
      // Criamos um texto longo que termina com o timestamp para ser sempre único
      const longo = 'B'.repeat(240) + Date.now(); 
      
      await page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' }).fill(longo);
      await page.locator('#modalContentSubject').selectOption({ index: 1 });
      await page.locator('#modalContentSemester').selectOption('1');
      
      await page.getByRole('button', { name: 'Salvar conteúdo' }).click();
      await expect(page.getByRole('textbox', { name: 'Ex: Derivadas e integrais,' })).not.toBeVisible();
    });
  });
});