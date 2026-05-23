/**
 * KOALA - SMS Service
 * Servicio para enviar notificaciones vía SMS (ej. a través de Twilio).
 * 
 * NOTA DE ARQUITECTURA:
 * Al igual que el Email Service, esto debe llamar a una Edge Function 
 * para no exponer las claves de Twilio en el cliente.
 */

import { supabase } from './supabaseClient.js';

export const smsService = {
  /**
   * Envía un SMS al cliente.
   * @param {string} phone - Número de teléfono del cliente.
   * @param {string} message - Contenido del mensaje.
   */
  async sendSMS(phone, message) {
    if (!phone) {
      console.warn('SMSService: No se proporcionó un número de teléfono.');
      return false;
    }

    try {
      console.log(`[SMSService] Simulando envío de SMS a ${phone}: "${message}"`);
      
      // Implementación Real (Supabase Edge Function):
      /*
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: { phone, message }
      });
      if (error) throw error;
      return data;
      */

      // Mock
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
    } catch (error) {
      console.error('SMSService Error:', error);
      return false;
    }
  },

  /**
   * Envía notificación de drop o promoción a una lista de clientes VIP
   */
  async broadcastToVip(clients, message) {
    const vipClients = clients.filter(c => c.status === 'vip' && c.phone);
    console.log(`[SMSService] Enviando broadcast a ${vipClients.length} VIPs...`);
    // Lógica para enviar en lote
    return true;
  }
};
