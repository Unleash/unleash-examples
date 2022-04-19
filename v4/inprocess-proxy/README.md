# Example app that creates two proxies in process

## To start

### Configure database
```sql
CREATE USER unleash_user WITH PASSWORD 'passord';
CREATE DATABASE unleashwithproxy WITH OWNER 'unleash_user';
```

### Install dependencies
```shell
$ yarn
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
{"level":"warn","message":"Production proxy is now available at http://localhost:4242/api/development/proxy with key: 9b6b72e46521d85cfda3af856d50a284476f82ae3dcc3f5e778c6fd559d97f59"}

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

`username: admin / password: unleash4all`





