/**
 * KOALA - Email Service
 * Este servicio actúa como interfaz para enviar emails transaccionales.
 * 
 * NOTA DE ARQUITECTURA:
 * Para evitar exponer claves de API (como Resend o SendGrid) en el cliente,
 * estas funciones deben llamar a una Supabase Edge Function.
 */

import { supabase } from './supabaseClient.js';

export const emailService = {
  /**
   * Envía un email de confirmación de orden.
   * @param {Object} order - Los detalles de la orden.
   * @param {Object} client - Los detalles del cliente (debe incluir email).
   */
  async sendOrderConfirmation(order, client) {
    if (!client?.email) {
      console.warn('EmailService: El cliente no tiene un email registrado.', client);
      return false;
    }

    try {
      console.log(`[EmailService] Simulando envío de confirmación a ${client.email} para la orden ${order.id}...`);
      
      // Implementación Real (Supabase Edge Function):
      /*
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { 
          template: 'order_confirmation',
          to: client.email,
          orderData: order
        }
      });
      if (error) throw error;
      return data;
      */

      // Mock para la versión actual:
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 800));
    } catch (error) {
      console.error('EmailService Error:', error);
      return false;
    }
  },

  /**
   * Envía un email cuando la orden ha sido marcada como 'Enviada'
   */
  async sendOrderShipped(order, client) {
    if (!client?.email) return false;

    try {
      console.log(`[EmailService] Simulando envío de 'Orden Enviada' a ${client.email}...`);
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 800));
    } catch (error) {
      console.error('EmailService Error:', error);
      return false;
    }
  }
};
