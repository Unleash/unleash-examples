import unleash, { ApiUser, LogLevel } from 'unleash-server';
import { createProxy } from './create-proxy';
import winston from 'winston';
import crypto from 'crypto';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});
export function start(): void {
    unleash.start({
        // @ts-ignore
        getLogger: (name) => logger.child({ name }),
        db: {
            user: 'unleash_user',
            password: 'passord',
            host: 'localhost',
            port: 5432,
            database: 'unleashwithproxy',
            ssl: false,
        },
        server: {
            enableRequestLogger: true,
            baseUriPath: '',
        },
        preHook: (app) => {
            let devKey = crypto.randomBytes(32).toString('hex');
            createProxy({
                environment: 'development',
                unleashServer: app,
                logger,
                clientKey: devKey,
                ApiUser: ApiUser,
            });
            logger.warn(
                `Development proxy is now available at http://localhost:4242/api/development/proxy with key: ${devKey}`,
            );

            let prodKey = crypto.randomBytes(32).toString('hex');
            createProxy({
                environment: 'production',
                unleashServer: app,
                logger,
                ApiUser: ApiUser,
                clientKey: prodKey,
            });
            logger.warn(
                `Production proxy is now available at http://localhost:4242/api/development/proxy with key: ${prodKey}`,
            );
        },
        logLevel: LogLevel.info,
    });
}
