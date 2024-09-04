# WIMP Wiki

<p align="center" style="margin: 50px 0">
    <img src="static/img/wimp-wiki.png" alt="WIMP Wiki Logo" style="height:200px; width:auto;"/>
<p>


## What is the WIMP System ?

WIMP is an IoT system that allows the students to get their teachers availability in real time.

The goal of this project is also to offer a functional IoT system to the researchers of the lab for the experiments.

## What is the WIMP Wiki ?

This project is a Wiki for the WIMP system. It contains many information about the architecture, the functioning and the deployement of the system.

It is built using [Docusaurus 2](https://docusaurus.io/), a modern static and open-source website generator.

## Installation

To install the project, you must have `yarn` installed on your machine and then launch :
```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

The website of the wiki is deloyed using Github Pages.

### Automatic Deployment with Github Actions

When pushing some changes on `main` branch, the wiki is automatically deployes on Github Pages thanks to Github Actions. Then, you can access the wiki by going on : https://ptidejteam.github.io/wimp-wiki/


### Manual Deployment

You can also deploy the wiki manually on Github Pages using the following command : 
```bash
GIT_USER=<Your_Github_Username> GIT_PASS=<Your_Personal_Access_Token> yarn deploy
```