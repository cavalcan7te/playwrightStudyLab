import { test, expect } from '@playwright/test';

// Helper para gerar data futura no formato YYYY-MM-DD
function dataFutura(diasAFrente = 30): string {
  const data = new Date();
  data.setDate(data.getDate() + diasAFrente);
  return data.toISOString().split('T')[0];
}

test.describe.serial('Casos Felizes - Trabalhos', () => {

  test('Cadastrar trabalho com dados válidos', async ({ page }) => {
    await page.goto('/works');
    await page.getByRole('button', { name: 'Novo trabalho' }).click();
    await page.locator('#workType').selectOption('Apresentação');
    await page.getByRole('textbox', { name: 'Ex: Pesquisa de História...' }).fill('apresentação de playwright');
    await page.locator('#workDueDate').fill('2026-06-07');
    await page.getByRole('button', { name: 'Salvar Trabalho' }).click();
    await expect(page.getByText('Trabalho criado com sucesso!')).toBeVisible({ timeout: 10000 });
  });

  test('Editar trabalho com dados válidos', async ({ page }) => {
    await page.goto('/works');
    await page.getByRole('button', { name: 'Editar' }).first().click();
    await page.locator('#workType').selectOption('Projeto');
    await page.getByRole('button', { name: 'Salvar Trabalho' }).click();
    await expect(page.getByText('Trabalho atualizado!')).toBeVisible({ timeout: 10000 });
  });

});

test.describe.serial('Casos Tristes - Trabalhos', () => {

  test('Cadastrar trabalho sem data de entrega não salva', async ({ page }) => {
    await page.goto('/works');
    await page.getByRole('button', { name: 'Novo trabalho' }).click();
    await page.locator('#workType').selectOption('Apresentação');
    await page.getByRole('textbox', { name: 'Ex: Pesquisa de História...' }).fill('pitch');
    await page.getByRole('button', { name: 'Salvar Trabalho' }).click();
    await expect(page.getByText('A data de entrega é obrigató')).toBeVisible({ timeout: 10000 });
  });

  test('Cadastrar trabalho sem descrição não salva', async ({ page }) => {
    await page.goto('/works');
    await page.getByRole('button', { name: 'Novo trabalho' }).click();
    await page.locator('#workType').selectOption('Artigo');
    await page.locator('#workDueDate').fill('2026-06-23');
    await page.getByRole('button', { name: 'Salvar Trabalho' }).click();
    await expect(page.getByText('A descrição é obrigatória.')).toBeVisible({ timeout: 10000 });
  });

});

test.describe.serial('Casos de Borda - Trabalhos', () => {

  test('Cadastrar trabalho com descrição de 1 caractere', async ({ page }) => {
    await page.goto('/works');
    await page.getByRole('button', { name: 'Novo trabalho' }).click();
    await page.locator('#workType').selectOption('Artigo');
    await page.getByRole('textbox', { name: 'Ex: Pesquisa de História...' }).fill('a');
    await page.locator('#workDueDate').fill(dataFutura()); // ✅ data dinâmica
    await page.getByRole('button', { name: 'Salvar Trabalho' }).click();
    await expect(page.getByText('Trabalho criado com sucesso!')).toBeVisible({ timeout: 10000 });
  });

  test('Cadastrar trabalho com descrição no limite máximo de caracteres', async ({ page }) => {
    await page.goto('/works');
    await page.getByRole('button', { name: 'Novo trabalho' }).click();
    await page.locator('#workType').selectOption('Artigo');
    await page.getByRole('textbox', { name: 'Ex: Pesquisa de História...' }).fill('a'.repeat(500));
    await page.locator('#workDueDate').fill(dataFutura()); // ✅ data dinâmica
    await page.getByRole('button', { name: 'Salvar Trabalho' }).click();
    const valor = await page.getByRole('textbox', { name: 'Ex: Pesquisa de História...' }).inputValue();
    expect(valor.length).toBeLessThanOrEqual(500);
  });

});