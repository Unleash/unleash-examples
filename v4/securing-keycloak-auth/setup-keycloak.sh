#!/bin/bash
# Requirements: jq https://stedolan.github.io/jq/
KC_HOST="http://localhost:8080"
UNLEASH_HOST="http://localhost:4242"

export ACCESS_TOKEN=$(curl -X POST "${KC_HOST}/realms/master/protocol/openid-connect/token" -H 'Accept: application/json' -d "username=admin" -d "password=admin" -d "grant_type=password" -d "client_id=admin-cli" | jq -r '.access_token')

CLIENT_ID=$(curl -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "Accept: application/json" "${KC_HOST}/admin/realms/master/clients?clientId=account" | jq -r '.[].id')

# Update client to accept redirects to unleash:
curl -X PUT -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "Accept: application/json" -H "Content-Type: application/json" "${KC_HOST}/admin/realms/master/clients/${CLIENT_ID}" -d "{\"redirectUris\": [\"${UNLEASH_HOST}/*\"]}"

# Set the email into the admin user
USER_ID=$(curl -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "Accept: application/json" "${KC_HOST}/admin/realms/master/users?username=admin" | jq -r '.[].id')

curl -X PUT -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "Accept: application/json" -H "Content-Type: application/json" "${KC_HOST}/admin/realms/master/users/${USER_ID}" -d "{\"email\": \"email@unleash.ai\"}"