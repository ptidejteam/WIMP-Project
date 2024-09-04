---
sidebar_position: 1
---

# Introduction

The backend part allows teachers to manage and define their states and to build their own logic in a Node-RED flow in order to compute their current state.

The principle of the backend part of the system is as follows:

A Node-RED server is used to process the information received from the different devices. This server is embedded in a Express.js server which have 3 main features:

- Serve as a firewall for the access to Node-RED.
- Expose a REST API which can be accessed through the frontend part of the system.
- Host the web pages accessible by the teachers.

In terms of software design, the backend part is separated in 2 sub parts :

- The front-backend which manages the Teacher interface via web pages. In this case, the backend corresponds to a classic web server
- The back-backend which contains the Node-Red part and the API accesible through the backend or the front of the system

The two parts of the backend are linked thanks to the Express.js server.