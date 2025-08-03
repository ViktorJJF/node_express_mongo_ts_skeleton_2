import mongoose from 'mongoose';
import loadModels from '../models';
import logger from './logger';

// mongoose.plugin(require('mongoose-beautiful-unique-validation')); // unique validator
mongoose.plugin(require('mongoose-paginate-v2')); // paginator
mongoose.plugin(require('mongoose-aggregate-paginate-v2')); // aggregate paginator

export default () => {
  const DB_URL = process.env.MONGO_URI;

  const connect = async () => {
    try {
      if (!DB_URL) {
        throw new Error('DB_URL environment variable is not defined');
      }
      await mongoose.connect(DB_URL, {
        maxPoolSize: 100, // Maintain up to 50 socket connections
        serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 30 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      });

      // Connection successful - no need to log here as server logs will show this
    } catch (err) {
      logger.error(`❌ Database connection failed: ${err}`);
      // Don't exit the process, let the reconnection logic handle it
    }
  };

  connect();

  mongoose.connection.on('error', (err) => {
    logger.error(`❌ MongoDB error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('🔌 MongoDB disconnected, attempting to reconnect...');
    connect();
  });

  mongoose.connection.on('connected', () => {
    logger.info('🗄️ MongoDB connected successfully');
  });

  loadModels();
};
