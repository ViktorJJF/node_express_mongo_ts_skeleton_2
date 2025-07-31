import TelegramBot from 'node-telegram-bot-api';
import logger from '../../../config/logger';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  logger.warn(
    'TELEGRAM_BOT_TOKEN not found, Telegram provider will be disabled.',
  );
}

const bot = token ? new TelegramBot(token) : null;

export const sendMessage = async (chatId: string, message: string) => {
  if (!bot) {
    logger.error(
      'Telegram bot is not initialized. TELEGRAM_BOT_TOKEN is likely missing.',
    );
    throw new Error('Telegram bot is not initialized.');
  }

  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    logger.info(`Message sent to ${chatId}`);
  } catch (error) {
    logger.error('Error sending message via Telegram:', error);
    throw error;
  }
};
