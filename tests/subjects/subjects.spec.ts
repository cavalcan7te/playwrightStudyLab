import { test, expect } from '@playwright/test';

test.describe.serial('Casos Felizes - Matérias', () => {

  test('Editar matéria com dados válidos', async ({ page }) => {
    await page.goto('/subjects');
    await page.getByRole('button', { name: 'Editar' }).first().click();
    await page.getByRole('textbox', { name: 'Ex: Prof. João Silva' }).clear();
    await page.getByRole('textbox', { name: 'Ex: Prof. João Silva' }).fill('Prof. dudao');
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByText('Matéria atualizada!')).toBeVisible({ timeout: 10000 });
  });

});

test.describe.serial('Casos Tristes - Matérias', () => {

  test('Cadastrar matéria sem semestre não salva', async ({ page }) => {
    await page.goto('/subjects');
    await page.getByRole('button', { name: 'Adicionar matéria' }).click();
    await page.locator('#modalSubjectName').selectOption('Literatura');
    await page.getByRole('textbox', { name: 'Ex: Prof. João Silva' }).fill('cristina');
    await page.getByRole('button', { name: 'Salvar matéria' }).click();
    await expect(page.getByText('Selecione ou informe o')).toBeVisible({ timeout: 10000 });
  });

  test('Cadastrar matéria sem professor não salva', async ({ page }) => {
    await page.goto('/subjects');
    await page.getByRole('button', { name: 'Adicionar matéria' }).click();
    await page.locator('#modalSubjectName').selectOption('Literatura');
    await page.locator('#modalSubjectSemester').selectOption('1');
    await page.getByRole('button', { name: 'Salvar matéria' }).click();
    await expect(page.getByText('Informe o nome do professor.')).toBeVisible({ timeout: 10000 });
  });

  test('Cadastrar matéria com professor acima de 255 caracteres não salva', async ({ page }) => {
    await page.goto('/subjects');
    await page.getByRole('button', { name: 'Adicionar matéria' }).click();
    await page.locator('#modalSubjectName').selectOption('Literatura');
    await page.getByRole('textbox', { name: 'Ex: Prof. João Silva' }).fill('a'.repeat(256));
    await page.locator('#modalSubjectSemester').selectOption('1');
    await page.getByRole('button', { name: 'Salvar matéria' }).click();
    await expect(page.getByText('O nome não pode ter mais de 255 caracteres.')).toBeVisible({ timeout: 10000 });
  });

});

test.describe.serial('Casos de Borda - Matérias', () => {

  test('Editar matéria com professor de 1 caractere', async ({ page }) => {
    await page.goto('/subjects');
    await page.getByRole('button', { name: 'Editar' }).first().click();
    await page.getByRole('textbox', { name: 'Ex: Prof. João Silva' }).clear();
    await page.getByRole('textbox', { name: 'Ex: Prof. João Silva' }).fill('a');
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByText('Matéria atualizada!')).toBeVisible({ timeout: 10000 });
  });

    test('Editar matéria com professor no limite máximo de 255 caracteres', async ({ page }) => {
    await page.goto('/subjects');
    await page.getByRole('button', { name: 'Editar' }).first().click();
    await page.getByRole('textbox', { name: 'Ex: Prof. João Silva' }).clear();
    await page.getByRole('textbox', { name: 'Ex: Prof. João Silva' }).fill('a'.repeat(249));
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByText('Matéria atualizada!')).toBeVisible({ timeout: 10000 });
    });
});