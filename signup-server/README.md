# signup-server

This is a [Next.js](https://nextjs.org/) application only using the [API routes](https://nextjs.org/docs/api-routes/introduction) feature to power the serverless functions require for signup.

**Environment variables**

| Name                        | Required | Description                                           |
| --------------------------- | -------- | ----------------------------------------------------- |
| `AIRTABLE_API_KEY`          | ✅       | AirTable API key for storing the user data.           |
| `AIRTABLE_BASE_ID`          | ✅       | AirTable Base ID where the user data is being stored. |
| `DISCORD_INVITE_BOT_TOKEN`  | ✅       | Discord bot token with instant invite permissions.    |
| `DISCORD_INVITE_CHANNEL_ID` | ✅       | Discord channel ID where to invite users.             |
| `SENDGRID_API_KEY`          | ✅       | Sendgrid API key for sending the email.               |
| `SENDGRID_SENDER_EMAIL`     | ✅       | Sender email to be used by Sendgrid.                  |

## Development

1. Install dependencies:

```sh
$ yarn install
```

2. Start development server:

```sh
$ yarn dev
```

## Deployment

1. Build the application:

```sh
yarn build
```

2. Start the application:

```sh
yarn start
```
