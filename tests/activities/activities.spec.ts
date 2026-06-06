import { test, expect } from '@playwright/test';

test.describe.serial('Casos Felizes - Atividades', () => {

  test('Cadastrar atividade com dados válidos', async ({ page }) => {
    await page.goto('/activities');
    await page.getByRole('button', { name: 'Nova atividade' }).click();
    await page.getByRole('textbox', { name: 'Ex: Fazer exercícios do capí' }).fill('renan crud');
    await page.locator('#modalSubjectId').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#modalSubjectId').selectOption({ index: 1 });
    await page.locator('#modalDueDateQuick').selectOption('1mes');
    await page.getByRole('button', { name: 'Salvar atividade' }).click();
    await expect(page.getByText('Lista atualizada.')).toBeVisible({ timeout: 10000 });
  });

  test('Editar atividade com dados válidos', async ({ page }) => {
    await page.goto('/activities');
    await page.getByRole('button', { name: '20' }).click();
    await page.getByRole('button', { name: 'Editar' }).first().click();
    await page.getByRole('textbox', { name: 'Ex: Fazer exercícios do capí' }).clear();
    await page.getByRole('textbox', { name: 'Ex: Fazer exercícios do capí' }).fill('redação');
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByText('Atividade atualizada!')).toBeVisible({ timeout: 10000 });
  });

});

test.describe.serial('Casos Tristes - Atividades', () => {

  test('Editar atividade com título vazio não salva', async ({ page }) => {
    await page.goto('/activities');
    await page.getByRole('button', { name: '20' }).click();
    await page.getByRole('button', { name: 'Editar' }).first().click();
    await page.getByRole('textbox', { name: 'Ex: Fazer exercícios do capí' }).clear();
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByText('Atividade atualizada!')).not.toBeVisible({ timeout: 5000 });
  });

  test('Cadastrar atividade com data inválida não salva', async ({ page }) => {
    await page.goto('/activities');
    await page.getByRole('button', { name: 'Nova atividade' }).click();
    await page.getByRole('textbox', { name: 'Ex: Fazer exercícios do capí' }).fill('crud');
    await page.locator('#modalSubjectId').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#modalSubjectId').selectOption({ index: 1 });
    await page.locator('#modalDueDateQuick').selectOption('custom');
    await page.locator('#modalDueDate').fill('1111-11-12');
    await page.getByRole('button', { name: 'Salvar atividade' }).click();
    await expect(page.getByText('A data não pode estar no passado.', { exact: false })).toBeVisible();
  });

});

test.describe.serial('Casos de Borda - Atividades', () => {

  test('Cadastrar atividade com descrição no limite máximo de caracteres', async ({ page }) => {
    await page.goto('/activities');
    await page.getByRole('button', { name: 'Nova atividade' }).click();
    await page.getByRole('textbox', { name: 'Ex: Fazer exercícios do capí' }).fill('a'.repeat(500));
    await page.locator('#modalSubjectId').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#modalSubjectId').selectOption({ index: 1 });
    await page.locator('#modalDueDateQuick').selectOption('2semanas');
    await page.getByRole('button', { name: 'Salvar atividade' }).click();
    const valor = await page.getByRole('textbox', { name: 'Ex: Fazer exercícios do capí' }).inputValue();
    expect(valor.length).toBeLessThanOrEqual(500);
  });

  test('Cadastrar atividade com descrição de 1 caractere', async ({ page }) => {
    await page.goto('/activities');
    await page.getByRole('button', { name: 'Nova atividade' }).click();
    await page.getByRole('textbox', { name: 'Ex: Fazer exercícios do capí' }).fill('a');
    await page.locator('#modalSubjectId').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#modalSubjectId').selectOption({ index: 1 });
    await page.locator('#modalDueDateQuick').selectOption('hoje');
    await page.getByRole('button', { name: 'Salvar atividade' }).click();
    await expect(page.getByRole('heading', { name: 'Cadastrar Atividade' })).not.toBeVisible({ timeout: 10000 });
  });

});