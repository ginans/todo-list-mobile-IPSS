import { test, expect } from '@playwright/test';

// PNG válido de 1x1 píxel (68 bytes) para probar el flujo completo de adjuntar imagen sin fixtures externos
const SAMPLE_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

// PNG válido con relleno de 16 MB para verificar el rechazo antes de procesar imágenes sobre el límite de 15 MB
const OVERSIZED_PNG_BUFFER = Buffer.concat([
  SAMPLE_PNG_BUFFER,
  Buffer.alloc(16 * 1024 * 1024),
]);

test.describe('Mis Tareas — Pruebas E2E de Periféricos (Foto + GPS), Seguridad PIN y Multi-Perfil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('debería crear perfil con PIN, adjuntar foto desde galería y coordenadas GPS, previsualizar imagen, completar y eliminar tarea', async ({
    page,
  }) => {
    await expect(page.getByText('Nuevo Perfil')).toBeVisible();

    await page.getByPlaceholder('Ej: Gina').fill('Gina');
    await page.getByPlaceholder('Ej: 1234').fill('1234');
    await page.getByText('Crear y Abrir Cuaderno').click();

    await expect(page.getByText('Cuaderno de Gina')).toBeVisible();
    await expect(page.getByText('0%')).toBeVisible();

    await page.getByText('Crear Primera Tarea').click();
    await expect(page.getByText('Nueva Tarea').first()).toBeVisible();

    await page.getByPlaceholder('Ej: Comprar café o revisar pendientes').fill('Comprar café');
    await page.getByPlaceholder('Detalles sobre lo que debes realizar...').fill('En grano entero');
    await page.getByText('Alta', { exact: true }).click();

    // Adjuntar imagen desde galería (simula selección de archivo de dispositivo)
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Galería', { exact: true }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'evidencia-cafe.png',
      mimeType: 'image/png',
      buffer: SAMPLE_PNG_BUFFER,
    });
    await expect(page.getByText('evidencia-cafe.png')).toBeVisible({ timeout: 10_000 });

    // Capturar geolocalización GPS simulada por el navegador (Santiago, Chile)
    await page.getByText('Registrar ubicación actual').click();
    await expect(page.getByText(/-33\.4489,\s*-70\.6693/).first()).toBeVisible({
      timeout: 10_000,
    });

    await page.getByText('Crear Tarea').click();
    await expect(page.getByText('Crear Tarea')).toBeHidden();

    // Validar que la tarea muestre foto adjunta y coordenadas GPS
    await expect(page.getByText('Comprar café')).toBeVisible();
    await expect(page.getByText(/-33\.4489,\s*-70\.6693/).first()).toBeVisible();
    await expect(page.getByLabel('Ver foto de Comprar café')).toBeVisible();

    // Abrir y cerrar vista previa ampliada de la fotografía
    await page.getByLabel('Ver foto de Comprar café').click();
    await expect(page.getByText('Cerrar vista previa')).toBeVisible();
    await page.getByText('Cerrar vista previa').click();
    await expect(page.getByText('Cerrar vista previa')).toBeHidden();

    // Marcar como completada y luego eliminar con confirmación
    await page.getByLabel('Marcar tarea Comprar café como completada').click();
    await expect(page.getByText('100%')).toBeVisible();

    await page.getByLabel('Eliminar tarea Comprar café').click();
    await expect(page.getByText('¿Eliminar esta tarea?')).toBeVisible();
    await page.getByText('Eliminar', { exact: true }).click();
    await expect(page.getByText('¡Aún no tienes tareas pendientes!')).toBeVisible();
  });

  test('debería exigir PIN nuevamente al recargar la app (sin auto-login), rechazar PIN incorrecto y desbloquear con PIN válido', async ({
    page,
  }) => {
    await page.getByPlaceholder('Ej: Gina').fill('Gina');
    await page.getByPlaceholder('Ej: 1234').fill('1234');
    await page.getByText('Crear y Abrir Cuaderno').click();
    await expect(page.getByText('Cuaderno de Gina')).toBeVisible();

    await page.getByLabel('Administrar perfil').click();
    await expect(page.getByText('Tu cuaderno local')).toBeVisible();
    await page.getByText('Cerrar', { exact: true }).click();

    // Al recargar la app debe pedir PIN nuevamente por seguridad
    await page.reload();
    await expect(page.getByText('Perfil seleccionado')).toBeVisible();

    await page.getByPlaceholder('Ingresa 4 dígitos').fill('9999');
    await page.getByText('Desbloquear con PIN').click();
    await expect(page.getByText('PIN incorrecto. Intenta nuevamente.')).toBeVisible();

    await page.getByPlaceholder('Ingresa 4 dígitos').fill('1234');
    await page.getByText('Desbloquear con PIN').click();
    await expect(page.getByText('Cuaderno de Gina')).toBeVisible();
  });

  test('debería aislar tareas y fotos en almacenamiento local independiente entre múltiples perfiles', async ({
    page,
  }) => {
    await page.getByPlaceholder('Ej: Gina').fill('Gina');
    await page.getByPlaceholder('Ej: 1234').fill('1234');
    await page.getByText('Crear y Abrir Cuaderno').click();

    await page.getByText('Crear Primera Tarea').click();
    await page.getByPlaceholder('Ej: Comprar café o revisar pendientes').fill('Tarea privada de Gina');
    await page.getByText('Crear Tarea').click();
    await expect(page.getByText('Tarea privada de Gina')).toBeVisible();

    await page.getByLabel('Cerrar sesión').click();
    await page.getByText('Crear nuevo perfil').click();
    await page.getByPlaceholder('Ej: Gina').fill('Invitado');
    await page.getByPlaceholder('Ej: 1234').fill('5678');
    await page.getByText('Crear y Abrir Cuaderno').click();

    await expect(page.getByText('Cuaderno de Invitado')).toBeVisible();
    await expect(page.getByText('¡Aún no tienes tareas pendientes!')).toBeVisible();
    await expect(page.getByText('Tarea privada de Gina')).toBeHidden();
  });

  test('debería rechazar imágenes que superen el límite máximo de 15 MB mostrando mensaje de error en el formulario', async ({
    page,
  }) => {
    await page.getByPlaceholder('Ej: Gina').fill('Gina');
    await page.getByPlaceholder('Ej: 1234').fill('1234');
    await page.getByText('Crear y Abrir Cuaderno').click();
    await expect(page.getByText('Cuaderno de Gina')).toBeVisible();

    await page.getByText('Crear Primera Tarea').click();
    await expect(page.getByText('Nueva Tarea').first()).toBeVisible();

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Galería', { exact: true }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'foto-pesada-16mb.png',
      mimeType: 'image/png',
      buffer: OVERSIZED_PNG_BUFFER,
    });

    await expect(
      page.getByText('La imagen supera el límite máximo permitido de 15 MB. Selecciona una imagen más liviana.')
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('foto-pesada-16mb.png')).toBeHidden();
  });
});
