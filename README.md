# Push notifications sample
Based on https://web.dev/push-notifications-server-codelab/

## Step auth
Create keys
```shell
npx web-push generate-vapid-keys
```

Save them in .env
```shell
VAPID_PUBLIC_KEY="blablaKEY"
VAPID_PRIVATE_KEY="blablaPRIVATE_KEY"
VAPID_SUBJECT="mailto:test@test.test"
```
## DB:
Create database dir for file
```shell
mkdir .data
touch .data/db.json
```
