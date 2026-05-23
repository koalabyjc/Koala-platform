/**
 * KOALA - Webhook Service
 * Servicio para enviar datos a plataformas externas como Make.com o Zapier.
 * 
 * NOTA DE ARQUITECTURA:
 * Idealmente configurado a nivel de base de datos en Supabase (Database Webhooks).
 * Sin embargo, si necesitamos gatillar eventos manuales desde el frontend, usamos este servicio.
 */

export const webhookService = {
  /**
   * Dispara un evento a un webhook externo.
   * @param {string} endpointUrl - La URL del webhook (ej. Make.com).
   * @param {Object} payload - Los datos a enviar.
   */
  async trigger(endpointUrl, payload) {
    if (!endpointUrl) return false;

    try {
      console.log(`[WebhookService] Enviando datos a ${endpointUrl}...`, payload);
      
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Webhook error');
      return true;
    } catch (error) {
      console.error('WebhookService Error:', error);
      return false;
    }
  },

  /**
   * Helper para enviar datos de un nuevo pedido a la ruta de "Fulfillment" en Make.com
   */
  async notifyFulfillmentSystem(order) {
    // Ejemplo: const MAKE_URL = 'https://hook.make.com/xxxxxx';
    // return this.trigger(MAKE_URL, { event: 'new_order', data: order });
    console.log('[WebhookService] Simulando envío a Fulfillment System...', order.id);
    return true;
  }
};
