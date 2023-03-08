# node-google-auth

A simple example using [google-auth-library](https://www.npmjs.com/package/google-auth-library) to authenticate and authorize users.

## Technologies used

- Node.js
- Express

## Getting Started

setup `google client id` and `google client secret` in your environment variable.
which can be found in https://console.cloud.google.com/apis/credentials

- set Authorized JavaScript origins as http://localhost:3000

- set Authorized redirect URIs as http://localhost:3000/auth/google/callback

```
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"
```

install dependencies

```bash
npm install
# or
pnpm install
```

start server

```bash
npm run dev
# or
pnpm dev
```

## Usage

- visit http://localhost:3000/auth/google to login
- visit http://localhost:3000/logout to logout
