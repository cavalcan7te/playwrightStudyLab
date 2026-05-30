import { test, expect, Page } from '@playwright/test';

const EMAIL = process.env.STUDYLAB_EMAIL || 'isaacmoreira@gmail.com';
const PASSWORD = process.env.STUDYLAB_PASSWORD || 'Escol@1005';

async function loginEIrParaNotas(page: Page) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'nome@exemplo.com' }).fill(EMAIL);
  await page.getByRole('textbox', { name: '••••••••' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Entrar na plataforma' }).click();
  await expect(page).not.toHaveURL(/\/login/);
  await page.getByRole('link', { name: 'Boletim Boletim' }).click();
  await expect(page).toHaveURL(/\/bulletin/);
  await page.waitForLoadState('networkidle');
}

async function abrirModalNovaNota(page: Page) {
  await page.getByRole('button', { name: 'Nova nota' }).click();
  await expect(page.locator('#gradeModalSubjectId')).toBeVisible({ timeout: 5000 });
}

// CASOS FELIZES
test.describe('✅ Casos Felizes — Notas', () => {

  test('CF-01 | Registrar uma nota válida', async ({ page }) => {
    await loginEIrParaNotas(page);
    await abrirModalNovaNota(page);

    await page.locator('#gradeModalSubjectId').selectOption('72');
    await page.locator('#gradeModalBimester').selectOption('1');
    await page.locator('#gradeModalMidterm').fill('8');
    await page.locator('#gradeModalEndterm').fill('9');

    await page.getByRole('button', { name: 'Salvar nota' }).click();
    await page.waitForTimeout(1000);

    await expect(page.locator('#gradeModalSubjectId')).not.toBeVisible();
  });

  test('CF-02 | Atualizar uma nota existente', async ({ page }) => {
    await loginEIrParaNotas(page);

    // Primeiro cria uma nota com matéria 77 para garantir que existe
    await abrirModalNovaNota(page);
    await page.locator('#gradeModalSubjectId').selectOption('77');
    await page.locator('#gradeModalBimester').selectOption('1');
    await page.locator('#gradeModalMidterm').fill('6');
    await page.locator('#gradeModalEndterm').fill('7');
    await page.getByRole('button', { name: 'Salvar nota' }).click();
    await page.waitForTimeout(1000);

    // Agora edita essa nota clicando no botão de editar dela
    const btnAdicionar = page.getByRole('button', { name: '+ Adicionar' }).first();
    await btnAdicionar.waitFor({ state: 'visible', timeout: 10000 });
    await btnAdicionar.click();
    await expect(page.locator('#gradeModalMidterm')).toBeVisible({ timeout: 5000 });

    // Seleciona a matéria e atualiza os valores
    await page.locator('#gradeModalSubjectId').selectOption('77');
    await page.locator('#gradeModalMidterm').fill('9');
    await page.locator('#gradeModalEndterm').fill('9');

    await page.getByRole('button', { name: 'Salvar nota' }).click();
    await page.waitForTimeout(1000);

    await expect(page.locator('#gradeModalMidterm')).not.toBeVisible();
  });

});

// CASOS TRISTES
test.describe('❌ Casos Tristes — Notas', () => {

  test('CT-01 | Inserir nota vazia não deve ser permitido', async ({ page }) => {
    await loginEIrParaNotas(page);
    await abrirModalNovaNota(page);

    await page.locator('#gradeModalSubjectId').selectOption('72');

    // Deixa os campos de nota em branco e tenta salvar
    await page.getByRole('button', { name: 'Salvar nota' }).click();
    await page.waitForTimeout(500);

    // Modal deve continuar aberto
    await expect(page.locator('#gradeModalSubjectId')).toBeVisible();
  });

  test('CT-02 | Campo numérico não aceita texto — atributo type=number garante isso', async ({ page }) => {
    await loginEIrParaNotas(page);
    await abrirModalNovaNota(page);

    const input = page.locator('#gradeModalMidterm');

    // Verifica que o campo é do tipo number (bloqueia texto nativamente)
    const tipo = await input.getAttribute('type');
    expect(tipo).toBe('number');

    // Verifica os limites declarados no HTML
    const min = await input.getAttribute('min');
    const max = await input.getAttribute('max');
    expect(min).toBe('0');
    expect(max).toBe('10');
  });

});

// CASOS DE BORDA
test.describe('⚠️ Casos de Borda — Notas', () => {

  test('CB-01 | Inserir nota mínima permitida (0)', async ({ page }) => {
    await loginEIrParaNotas(page);
    await abrirModalNovaNota(page);

    await page.locator('#gradeModalSubjectId').selectOption('72');
    await page.locator('#gradeModalBimester').selectOption('1');
    await page.locator('#gradeModalMidterm').fill('0');
    await page.locator('#gradeModalEndterm').fill('0');

    await page.getByRole('button', { name: 'Salvar nota' }).click();
    await page.waitForTimeout(1000);

    await expect(page.locator('#gradeModalSubjectId')).not.toBeVisible();
  });

  test('CB-02 | Inserir nota máxima permitida (10)', async ({ page }) => {
    await loginEIrParaNotas(page);
    await abrirModalNovaNota(page);

    await page.locator('#gradeModalSubjectId').selectOption('72');
    await page.locator('#gradeModalBimester').selectOption('1');
    await page.locator('#gradeModalMidterm').fill('10');
    await page.locator('#gradeModalEndterm').fill('10');

    await page.getByRole('button', { name: 'Salvar nota' }).click();
    await page.waitForTimeout(1000);

    await expect(page.locator('#gradeModalSubjectId')).not.toBeVisible();
  });

});