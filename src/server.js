#!/usr/bin/env node

import http from 'http';
import app from "./app";
import 'babel-polyfill';

const httpServer = http.createServer(app);

const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
    console.log('port %s, env=%s', port, process.env.NODE_ENV);
});
