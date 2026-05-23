/* ============================================
   KOALA — Configuracion Page
   System settings and Database Sync
   ============================================ */

import { icon } from '../utils/icons.js';
import { localDb } from '../utils/localDb.js';

export function renderPlaceholderPage() {
  return `
    <div class="animate-fade-in-up" style="max-width: 800px; margin: 0 auto; padding: 24px;">
      <div style="background: var(--color-bg-elevated); border-radius: 16px; padding: 32px; box-shadow: var(--shadow-card);">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(198, 162, 122, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center;">
            ${icon('settings', 24)}
          </div>
          <div>
            <h2 style="font-size: 24px; color: var(--color-text-primary); margin: 0;">Configuración del Sistema</h2>
            <p style="color: var(--color-text-secondary); margin: 4px 0 0 0;">Sincroniza y protege la base de datos de tu tienda.</p>
          </div>
        </div>

        <div style="padding: 24px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px;">
            ${icon('database', 18)} Sincronización Local (Modo Pruebas)
          </h3>
          <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 20px; line-height: 1.5;">
            Si abres la tienda desde tu celular u otra dirección y la ves vacía, usa estas opciones para transferir tus datos. 
            Primero "Respaldar" desde tu computadora, luego "Cargar" desde tu celular.
          </p>
          
          <div style="display: flex; gap: 16px; flex-wrap: wrap;">
            <button onclick="window.syncDataToServer()" class="btn btn--primary" style="flex: 1; display: flex; justify-content: center; gap: 8px;">
              ${icon('upload-cloud', 18)} 1. Respaldar al Servidor (WiFi)
            </button>
            <button onclick="window.syncDataFromServer()" class="btn btn--secondary" style="flex: 1; display: flex; justify-content: center; gap: 8px; border: 1px solid var(--color-neutral-border);">
              ${icon('download-cloud', 18)} 2. Cargar en este Dispositivo
            </button>
          </div>
        </div>

        <div style="padding: 24px; background: rgba(198, 162, 122, 0.05); border: 1px solid rgba(198, 162, 122, 0.2); border-radius: 12px;">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; color: var(--color-primary); display: flex; align-items: center; gap: 8px;">
            ${icon('cloud', 18)} Conexión a la Nube (Supabase)
          </h3>
          <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 16px; line-height: 1.5;">
            Para que la tienda funcione en internet para clientes reales en todo el mundo, necesitamos el <strong>URL del Proyecto</strong> de Supabase. 
            Actualmente solo proporcionaste las llaves (keys).
          </p>
          <div style="background: var(--color-bg-main); padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: var(--color-text-muted); word-break: break-all;">
            <strong>Falta el URL:</strong> https://[TU_PROYECTO].supabase.co
          </div>
        </div>
      </div>
    </div>
  `;
}

// Global functions for the buttons
window.syncDataToServer = async () => {
  try {
    const data = await localDb.exportData();
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      alert('¡Datos respaldados con éxito al servidor WiFi! Ahora abre tu celular y presiona "Cargar en este Dispositivo".');
    } else {
      alert('Error: Asegúrate de que el servidor esté corriendo.');
    }
  } catch (e) {
    alert('Error de conexión con el servidor local.');
  }
};

window.syncDataFromServer = async () => {
  try {
    const res = await fetch('/api/sync');
    if (res.ok) {
      const data = await res.json();
      if (Object.keys(data).length === 0) {
        alert('El servidor WiFi no tiene datos aún. Haz un respaldo desde tu computadora principal primero.');
        return;
      }
      await localDb.importData(data);
      alert('¡Datos cargados con éxito! El sistema se reiniciará para mostrar los cambios.');
      window.location.reload();
    }
  } catch (e) {
    alert('Error al intentar descargar los datos.');
  }
};
