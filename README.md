# WIMP Wiki

<p align="center" style="margin: 50px 0">
    <img src="static/img/wimp-wiki.png" alt="WIMP Wiki Logo" style="height:200px; width:auto;"/>
<p>


## What is the WIMP System?

WIMP is an IoT system that allows students to get their teachers' availability in real-time.

The goal of this project is also to offer a functional IoT system to the researchers of the lab for experiments.

## What is the WIMP Wiki?

This project is a Wiki for the WIMP system. It contains information about the architecture, functioning, and deployment of the system.

It is built using [Docusaurus 2](https://docusaurus.io/), a modern static and open-source website generator.

## Installation

To install the project, you must have `yarn` installed on your machine and then run:

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without restarting the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory, which can be served using any static content hosting service.

## Deployment

The website for the wiki is deployed using GitHub Pages.

### Automatic Deployment with GitHub Actions

When changes are pushed to the `main` branch, the wiki is automatically deployed to GitHub Pages using GitHub Actions. You can access the wiki at: [https://ptidejteam.github.io/wimp-wiki/](https://ptidejteam.github.io/wimp-wiki/).

#### How It Works

The GitHub Action is configured to trigger whenever changes are pushed to the `main` branch. It runs a workflow that builds the project and deploys the generated static files to the `gh-pages` branch, which is then served by GitHub Pages.

This automation ensures that the wiki is always up-to-date with the latest changes without requiring manual intervention.

### Manual Deployment

You can also deploy the wiki manually to GitHub Pages using the following command:

```bash
GIT_USER=<Your_Github_Username> GIT_PASS=<Your_Personal_Access_Token> yarn deploy
```

This will build and deploy the wiki directly from your local machine.

---