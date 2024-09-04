---
sidebar_position: 1
---

# Contribute on the WIMP system

To contribute on the backend or the frontend of the WIMP system, you need to setup the development environment. 

## Setup the Backend development environment

To setup the backend developement environment you need to :
- Pull the [Github project](https://github.com/ptidejteam/wimp-backend) of the backend.
- Install the dependencies:
```bash
cd ~/wimp-backend/ExpressNodeRed
npm install
```

- Install Redis :
```bash
sudo apt-get install redis-server
```

- Configure the dotenv environment as followed:
    - Create a `.env` file
    
    - Write in the file the following line (you need to fill the 
    ```bash
    ENV=dev
    PROTOCOL=http
    FRONTEND_HOST=localhost
    FRONTEND_PORT=3000
    BACKEND_HOST=localhost
    BACKEND_PORT=8000
    SESSION_SECRET=**Generare a session secret to manage the session**
    BACKEND_SECRET=**Encrypted secret of the Backend with Bcrypt**
    BACKEND_RESTRICTED_ACCESS=/node/currentStates
    EXTERNAL_DEVICES_ROUTES=**List of the Node-RED endpoints in your flows**
    NODE_RED_SECRET=**Clear password of Node-RED API**
    NODE_RED_SECRET_ENC=**Encrypted password of Node-RED API with Bcrypt**
    REDIS_URL=redis://127.0.0.1:6379/0
    ```

:::note
The field `EXTERNAL_DEVICES_ROUTES` field must be formatted like `/myroute1,/myroute2,/myroute3`.
:::

- Start the backend:
```bash
npm run start
```

- You can also start the backend with nodemon:
```bash
npm run dev
```

## Setup the Backend development environment

To setup the frontend developement environment you need to :
- Pull the [Github project](https://github.com/ptidejteam/wimp-frontend) of the frontend.
- Install the dependencies:
```bash
cd ~/wimp-frontend
npm install
```
- Configure the dotenv environment as followed:
    - Create a `.env` file

    - Write in the file the following line (you need to fill the **fields\**)
    ```bash
    ENV=dev
    PROTOCOL=http
    FRONTEND_HOST=localhost
    FRONTEND_PORT=3000
    BACKEND_HOST=localhost
    BACKEND_PORT=8000
    SESSION_SECRET=**Generare a session secret to manage the session**
    BACKEND_SECRET=**Generare a backend secret to manage the backend access**
    ```

:::note
The field `EXTERNAL_DEVICES_ROUTES` field must be formatted like `/myroute1,/myroute2,/myroute3`.
:::

- Start the frontend:
```bash
npm run start
```

- You can also start the frontend with nodemon:
```bash
npm run dev
```