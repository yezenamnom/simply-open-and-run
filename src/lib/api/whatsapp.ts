export interface WhatsAppConfig {
  apiKey: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  webhookUrl?: string;
  enabled: boolean;
}

export interface WhatsAppMessage {
  to: string;
  message: string;
  type?: 'text' | 'template' | 'media';
  mediaUrl?: string;
}

export class WhatsAppService {
  private config: WhatsAppConfig | null = null;

  setConfig(config: WhatsAppConfig) {
    this.config = config;
    localStorage.setItem('whatsapp_config', JSON.stringify(config));
  }

  getConfig(): WhatsAppConfig | null {
    const stored = localStorage.getItem('whatsapp_config');
    if (stored) {
      return JSON.parse(stored);
    }
    return this.config;
  }

  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    const config = this.getConfig();
    if (!config || !config.enabled || !config.apiKey) {
      throw new Error('WhatsApp is not configured or enabled');
    }

    try {
      // استخدام WhatsApp Business API
      // يمكن استخدام خدمات مثل Twilio, MessageBird, أو WhatsApp Cloud API
      const response = await fetch('https://graph.facebook.com/v18.0/me/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: message.to,
          type: message.type || 'text',
          text: message.type === 'text' ? { body: message.message } : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'WhatsApp API error');
      }

      return true;
    } catch (error) {
      console.error('WhatsApp send error:', error);
      throw error;
    }
  }

  // طريقة بديلة باستخدام webhook
  async sendViaWebhook(message: WhatsAppMessage): Promise<boolean> {
    const config = this.getConfig();
    if (!config || !config.webhookUrl) {
      throw new Error('Webhook URL is not configured');
    }

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: message.to,
          message: message.message,
          type: message.type || 'text',
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('WhatsApp webhook error:', error);
      throw error;
    }
  }
}

export const whatsappService = new WhatsAppService();

