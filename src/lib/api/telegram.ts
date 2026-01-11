export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export const telegramApi = {
  async sendMessage(
    botToken: string,
    chatId: string,
    message: string
  ): Promise<{ success: boolean; messageId?: number; error?: string }> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.description || 'فشل إرسال الرسالة');
      }

      return {
        success: true,
        messageId: data.result?.message_id,
      };
    } catch (error: any) {
      console.error('Telegram API error:', error);
      return {
        success: false,
        error: error.message || 'فشل إرسال الرسالة إلى Telegram',
      };
    }
  },
};

