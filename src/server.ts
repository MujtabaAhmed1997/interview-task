import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './common/config/database';
import { logger } from './common/util/logger';
import { disconnectRedis } from './common/util/redis';
import { secrets } from './common/util/secrets';

const start = async (): Promise<void> => {
  await connectDatabase();
  const app = createApp();
  const server = app.listen(secrets.port, () => {
    logger.info({ event: 'server.started', port: secrets.port, env: secrets.env });
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ event: 'server.shutdown', signal });
    server.close();
    await disconnectDatabase();
    await disconnectRedis();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
};

start().catch((error: unknown) => {
  logger.error({ event: 'server.start_failed', message: error instanceof Error ? error.message : 'Unknown error' });
  process.exit(1);
});
