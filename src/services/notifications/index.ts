import * as telegramProvider from './providers/telegram';
import logger from '../../config/logger';

interface NotificationProvider {
  sendMessage: (recipient: string, message: string) => Promise<void>;
}

// Helper function to escape markdown characters for Telegram MarkdownV2
const escapeMarkdown = (text: string): string => {
  // Characters that need to be escaped in MarkdownV2: _ * [ ] ( ) ~ ` > # + = | { } . ! -
  const specialChars = /[_*[\]()~`>#+=|{}.!-]/g;
  return text.replace(specialChars, '\\$&');
};

// Helper function to convert HTML-like formatting to markdown
const convertToMarkdown = (htmlText: string): string => {
  return htmlText
    .replace(/<b>(.*?)<\/b>/g, '*$1*')
    .replace(/<pre>([\s\S]*?)<\/pre>/g, '```\n$1\n```')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
};

class NotificationManager {
  private providers: { [key: string]: NotificationProvider } = {};

  constructor() {
    this.registerProvider('telegram', telegramProvider);
  }

  registerProvider(name: string, provider: NotificationProvider) {
    this.providers[name] = provider;
    logger.info(`Notification provider '${name}' registered.`);
  }

  async sendNotification(provider: string, recipient: string, message: string) {
    const selectedProvider = this.providers[provider];
    if (selectedProvider) {
      // For Telegram, we need to escape markdown characters properly
      let processedMessage = message;
      if (provider === 'telegram') {
        processedMessage = escapeMarkdown(message);
      }
      await selectedProvider.sendMessage(recipient, processedMessage);
    } else {
      logger.error(`Notification provider '${provider}' not found.`);
      throw new Error(`Notification provider '${provider}' not found.`);
    }
  }
}

export const notificationManager = new NotificationManager();
