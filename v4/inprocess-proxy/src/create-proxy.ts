import crypto from 'crypto';
import { Express } from 'express';
import { Logger } from 'winston';
import { createApp as proxy } from '@unleash/proxy';

export interface ICreateProxyArgs {
    environment: string;
    unleashServer: Express;
    clientKey: string;
    logger: Logger;
    ApiUser;
    path?: string;
    pollInterval?: number;
    port?: number;
}

export function createProxy({
    environment,
    unleashServer,
    path,
    pollInterval,
    clientKey,
    logger,
    ApiUser,
    port,
}: ICreateProxyArgs): void {
    const unleashPort = port || 4242;
    const basePath = path || '';
    const communicationToken = crypto.randomBytes(20).toString('hex');
    const createToken = (env) => {
        const data = {
            isApi: true,
            username: `proxy-client-${env}`,
            permissions: ['CLIENT'],
            env,
            project: '*',
            type: 'client',
        };
        return ApiUser ? new ApiUser(data) : data;
    };
    logger.info(`Configuring Unleash Proxy for ${environment} environment`);
    unleashServer.use(`${basePath}/api/client`, (req, res, next) => {
        const authorization = req.header('authorization');
        if (communicationToken === authorization) {
            // @ts-ignore
            req.user = createToken(environment);
        }
        next();
    });

    proxy(
        {
            unleashAppName: `proxy-${environment}`,
            proxyBasePath: `${basePath}/api/${environment}`,
            // @ts-ignore
            logger: logger,
            refreshInterval: pollInterval || 10_0000,
            unleashUrl: `http://localhost:${unleashPort}/api/`,
            unleashApiToken: communicationToken,
            proxySecrets: [clientKey],
            trustProxy: true,
        },
        undefined,
        unleashServer,
    );
    logger.info(`Proxy setup for ${environment}`);
}
