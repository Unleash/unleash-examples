# Example app that creates two proxies in process



## Running the example

### Configure database
```sql
CREATE USER unleash_user WITH PASSWORD 'passord';
CREATE DATABASE unleashwithproxy WITH OWNER 'unleash_user';
```

### Install dependencies
```shell
yarn
```

### Start server
```shell
yarn start
```

### Use proxies

The server is now running on http://localhost:4242, and have logged keys for using the proxies to stdout
```shell
{"level":"info","message":"Configuring Unleash Proxy for development environment"}
{"level":"info","message":"Proxy setup for development"}
{"level":"warn","message":"Development proxy is now available at http://localhost:4242/api/development/proxy with key: 1154fd724a5166f0cbd711b2e282b1ea4c106780bc4c9567cde7c4ed71283013"}
{"level":"info","message":"Configuring Unleash Proxy for production environment"}
{"level":"info","message":"Proxy setup for production"}
{"level":"warn","message":"Production proxy is now available at http://localhost:4242/api/production/proxy with key: 9b6b72e46521d85cfda3af856d50a284476f82ae3dcc3f5e778c6fd559d97f59"}

```

# Test the proxies

For development:
```shell
curl -H"Authorization: <key logged to console for development> http://localhost:4242/api/development/proxy"
```

For production
```shell
curl -H"Authorization: <key logged to console for production> http://localhost:4242/api/production/proxy"
```


### Use Unleash
 
This uses the standard authentication setup, so you can log in and configure toggles by using the following username/password:

- username: `admin`
- password: `unleash4all`



## Explanation / How it's done

### createProxy
- First we create a `createProxy` function. See [create-proxy.ts](./src/create-proxy.ts).
    - This configures a cryptographically random key for communication between the proxy and the unleash-server.
```typescript
    const communicationToken = crypto.randomBytes(20).toString('hex');
```

- Then we set up a middleware for unleash server which checks the authorization header on each request.
    - If the authorization header is equal to the random key we created,
      we setup an ApiUser with `client` access rights and set that on the request before passing control back to unleash.

```typescript
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
```
- If the authorization header is not equal to our random key, our `preHook` is done and control is passed on to the next handler in the chain.
- This allows Unleash to treat our in-process proxy as a client, without ever having to add an API key to the database.
- Finally, we call the unleash-proxy's createApp method (which we've renamed here to `proxy`)

```typescript
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
```

- We see that we ask the proxy to use a common basepath with Unleash
```typescript
proxyBasePath: `${basePath}/api/${environment}`
```
- So once we call this for `development`, we'll have a proxy running on `${unleashBasePath}/api/development/proxy`

### index.ts
- In [index.ts](./src/index.ts) we
    - Configure a preHook for unleash which will:
        - Configure a random proxy key for each environment we want to have a running proxy for.
            - For a production setup, this should probably be changed to reading the desired key from an environment key or file.
            - Telling our proxy users to change their key everytime we restart the server would be troublesome
        - We then call the createProxy function once for each environment we want to have a proxy enabled for.
            - In this case, development and production
```typescript
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
}
```


