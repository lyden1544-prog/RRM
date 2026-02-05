import http from 'http';
import app from './src/app.js';
import env from './src/config/env.js';
import { initDatabase } from './src/config/database.js';
import logger from './src/utils/logger.js';
import { Server as SocketIOServer } from 'socket.io';

let server = null;

const startServer = async () => {
  try {
    logger.info('Initializing database connection...');
    initDatabase();

    server = http.createServer(app);

    const io = new SocketIOServer(server, {
      cors: {
        origin: env.CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });

      socket.on('agent:metrics', (data) => {
        logger.debug('Received metrics from agent:', data);
        io.emit('metrics:update', data);
      });

      socket.on('dashboard:subscribe', (deviceId) => {
        logger.debug(`Dashboard subscribed to device: ${deviceId}`);
        socket.join(`device:${deviceId}`);
      });

      socket.on('dashboard:unsubscribe', (deviceId) => {
        socket.leave(`device:${deviceId}`);
      });
    });

    app.io = io;

    server.listen(env.PORT, () => {
      logger.info(`
        ╔═══════════════════════════════════╗
        ║  🚀 MockConnect Backend Server    ║
        ║  Running on port ${env.PORT}            ║
        ║  Environment: ${env.NODE_ENV}      ║
        ╚═══════════════════════════════════╝
      `);
    });

  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  logger.info('Shutting down gracefully...');
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forced shutdown');
      process.exit(1);
    }, 10000);
  }
}

startServer();
export default server;