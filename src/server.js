#!/usr/bin/env node

/* eslint "no-console": 0 */
/* eslint "import/no-extraneous-dependencies": 0 */

import http from 'http';
import 'babel-polyfill';
import app from './app';

const httpServer = http.createServer(app);

const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
    console.log('port %s, env=%s', port, process.env.NODE_ENV);
});
