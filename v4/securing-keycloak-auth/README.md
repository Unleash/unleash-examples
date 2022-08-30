# Prerequisites
In order to run the test you will need
- jq https://stedolan.github.io/jq/
- docker https://docs.docker.com/engine/install/
- yarn: https://yarnpkg.com/getting-started/install 

# Steps:
**Note:** Docker parameter `--network host` might be too open but it was needed in order for this to work

1. Initiate postgres: `docker run --rm -e POSTGRES_PASSWORD=some_password -e POSTGRES_USER=unleash_user -e POSTGRES_DB=unleash --network host --name postgres postgres`
2. Start keycloak: `docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:19.0.1 start-dev` (wait until you see the message: _Running the server in development mode. DO NOT use this configuration in production._)
3. Run `./setup-keycloak.sh`
4. Start Unleash: `AUTH_HOST=http://localhost:8080 AUTH_REALM=master AUTH_CLIENT_ID=account yarn start`
5. You should be able to login at `http://localhost:4242` with user admin and password admin