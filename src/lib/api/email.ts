export interface EmailConfig {
  to: string;
  subject: string;
  body: string;
  from?: string;
  cc?: string;
  bcc?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;
}

export const emailApi = {
  async sendEmail(config: EmailConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // استخدام EmailJS أو خدمة أخرى
      // هذا مثال باستخدام EmailJS
      if (!window.emailjs) {
        // إذا لم يكن EmailJS متاحاً، نستخدم API بسيط
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: config.to,
            subject: config.subject,
            body: config.body,
            from: config.from || 'noreply@example.com',
          }),
        });

        if (!response.ok) {
          throw new Error('فشل إرسال البريد الإلكتروني');
        }

        const data = await response.json();
        return {
          success: true,
          messageId: data.messageId,
        };
      }

      // استخدام EmailJS إذا كان متاحاً
      const result = await window.emailjs.send(
        'service_id', // Service ID
        'template_id', // Template ID
        {
          to_email: config.to,
          subject: config.subject,
          message: config.body,
          from_name: config.from || 'Smart Learning Platform',
        }
      );

      return {
        success: true,
        messageId: result.text,
      };
    } catch (error: any) {
      console.error('Email API error:', error);
      return {
        success: false,
        error: error.message || 'فشل إرسال البريد الإلكتروني',
      };
    }
  },
};

// Type declaration for EmailJS
declare global {
  interface Window {
    emailjs?: {
      send: (serviceId: string, templateId: string, params: any) => Promise<{ text: string }>;
    };
  }
}

