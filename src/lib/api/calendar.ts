export type CalendarProvider = 'google' | 'outlook' | 'ical' | 'custom';

export interface CalendarConfig {
  provider: CalendarProvider;
  apiKey?: string;
  accessToken?: string;
  calendarId?: string;
  enabled: boolean;
}

export interface CalendarEvent {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: string[];
  reminders?: number[]; // minutes before
}

export class CalendarService {
  private configs: Map<CalendarProvider, CalendarConfig> = new Map();

  setConfig(config: CalendarConfig) {
    this.configs.set(config.provider, config);
    const configs = Array.from(this.configs.values());
    localStorage.setItem('calendar_configs', JSON.stringify(configs));
  }

  getConfig(provider: CalendarProvider): CalendarConfig | undefined {
    const stored = localStorage.getItem('calendar_configs');
    if (stored) {
      const configs: CalendarConfig[] = JSON.parse(stored);
      const config = configs.find(c => c.provider === provider);
      if (config) {
        this.configs.set(provider, config);
        return config;
      }
    }
    return this.configs.get(provider);
  }

  async createEvent(provider: CalendarProvider, event: CalendarEvent): Promise<string> {
    const config = this.getConfig(provider);
    if (!config || !config.enabled) {
      throw new Error(`Calendar provider ${provider} is not configured or enabled`);
    }

    switch (provider) {
      case 'google':
        return this.createGoogleEvent(config, event);
      case 'outlook':
        return this.createOutlookEvent(config, event);
      case 'ical':
        return this.createICalEvent(event);
      default:
        throw new Error(`Unsupported calendar provider: ${provider}`);
    }
  }

  private async createGoogleEvent(config: CalendarConfig, event: CalendarEvent): Promise<string> {
    if (!config.accessToken) {
      throw new Error('Google Calendar access token is required');
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${config.calendarId || 'primary'}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.start.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: event.end.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          location: event.location,
          attendees: event.attendees?.map(email => ({ email })),
          reminders: {
            useDefault: false,
            overrides: event.reminders?.map(minutes => ({
              method: 'email',
              minutes,
            })),
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Google Calendar API error');
    }

    const data = await response.json();
    return data.id;
  }

  private async createOutlookEvent(config: CalendarConfig, event: CalendarEvent): Promise<string> {
    if (!config.accessToken) {
      throw new Error('Outlook access token is required');
    }

    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: event.title,
        body: {
          contentType: 'HTML',
          content: event.description || '',
        },
        start: {
          dateTime: event.start.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        location: {
          displayName: event.location,
        },
        attendees: event.attendees?.map(email => ({
          emailAddress: { address: email },
          type: 'required',
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Outlook API error');
    }

    const data = await response.json();
    return data.id;
  }

  private createICalEvent(event: CalendarEvent): Promise<string> {
    // إنشاء ملف iCal
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Smart Learning Platform//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@smartlearning.com`,
      `DTSTART:${this.formatICalDate(event.start)}`,
      `DTEND:${this.formatICalDate(event.end)}`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
      event.location ? `LOCATION:${event.location}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    // تحميل الملف
    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    link.click();
    URL.revokeObjectURL(url);

    return Promise.resolve('downloaded');
  }

  private formatICalDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  // Google OAuth helper
  async requestGoogleAuth(): Promise<string> {
    // يجب توجيه المستخدم إلى Google OAuth
    const clientId = 'YOUR_GOOGLE_CLIENT_ID';
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/calendar.events';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    
    window.location.href = authUrl;
    return '';
  }
}

export const calendarService = new CalendarService();

