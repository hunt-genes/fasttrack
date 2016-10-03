import path from 'path';
import express from 'express';
import csv from 'fast-csv';
import favicon from 'serve-favicon';
import ReactDOMServer from 'react-dom/server';
import Request from './models/Request';
import db from './lib/db';
import routes from './routes';
import bodyParser from 'body-parser';
import Router from 'isomorphic-relay-router';
import RelayLocalSchema from 'relay-local-schema';
// import Helmet from 'react-helmet';
import { match } from 'react-router';
import graphqlHTTP from 'express-graphql';
import schema from './schema';

import Result from './models/Result';
import prepareQuery from './models/prepareQuery';

const app = express();
app.db = db;

function getIP(req) {
    const ips = req.headers['x-forwarded-for'] || // from proxy
        req.connection.remoteAddress || // different versions of node
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    return ips.split(',').pop();
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// request logging middleware, logs timestamp, ip and query if defined
app.use((req, res, next) => {
    const q = req.query.q;

    if (q) {
        const ip = getIP(req);
        const request = new Request();
        request.ip = ip;
        request.query = q;
        request.save((err) => {
            if (err) { return next(err); }
        });
    }

    // do not wait for request logger
    next();
});

// Export data as CSV
app.get('/search/export', (req, res, next) => {
    // query term
    const term = req.query.q;

    // If we restrict to tromso imputation data, default: false
    let tromso = false;
    if (req.query.tromso) {
        tromso = JSON.parse(req.query.tromso) || false;
    }

    // If we restrict to unique SNPs. For export, default is true
    let unique = true;
    if (req.query.unique) {
        unique = JSON.parse(req.query.unique);
    }

    const query = prepareQuery(term, unique, tromso);
    Result.find(query).sort('sortable_chr_id chr_pos').exec().then(_results => {
        const results = _results.map(_result => {
            const result = _result.toObject();
            result.mapped_genes = result.genes;
            delete result.genes;
            return result;
        });
        csv.writeToString(results, { headers: [
            'snp_id_current',
            'chr_id',
            'chr_pos',
            'strongest_snp_risk_allele',
            'snps',
            'p_value',
            'or_or_beta',
            'p95_ci_text',
            'risk_allele_frequency',
            'hg19chr',
            'hg19pos',
            'mapped_genes',
            'initial_sample_size',
            'replication_sample_size',
            'date',
        ], delimiter: '\t' }, (err, data) => {
            res.set('Content-Type', 'text/csv');
            res.set(
                'Content-Disposition',
                `attachment; filename=export-${term.replace(/[^a-zA-Z0-9]+/g, '-')}.csv`
            );
            res.write(data);
            res.end();
        });
    });
});

app.post('/variables/:trait', (req, res, next) => {
    let rsids;
    if (Array.isArray(req.body.rsids)) {
        rsids = req.body.rsids;
    }
    else if (req.body.rsids) {
        rsids = [req.body.rsids];
    }
    else {
        rsids = [];
    }
    const data = rsids.join('\r\n') + '\r\n';
    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition',
            `attachment; filename=trait-${req.params.trait.replace(/[^a-zA-Z0-9]+/g, '-')}.csv`);
    res.write(data);
    res.end();
});

if (app.settings.env === 'production') {
    app.use(favicon(__dirname + '/../dist/favicon.ico'));
}
else {
    app.use(favicon(__dirname + '/../src/favicon.ico'));
}
app.use(express.static(path.join(__dirname, '..', 'dist')));

app.use('/graphql', graphqlHTTP(req => ({
    schema,
    rootValue: { term: 'foot' },
    pretty: process.env.NODE_ENV !== 'production',
    graphiql: process.env.NODE_ENV !== 'production',
})));

function renderFullPage(renderedContent, initialState, head = {
    title: '<title>Fast-track</title>',
    meta: '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    link: '<link rel="stylesheet" href="/stylesheet.css"/>',
}) {
    return `
    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8" />
        ${head.title}
        ${head.meta}
        ${head.link}
    </head>
    <body>
        <div id="app">${renderedContent}</div>
        <script>
            window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
        </script>
        <script src="/client.js"></script>
    </body>
    </html>
    `;
}

/** Universal app endpoint **/
app.get('*', (req, res, next) => {
    match({ routes, location: req.url }, (err, redirectLocation, renderProps) => {
        if (err) {
            return next(err);
            // res.status(500).send(err.message);
        }
        else if (redirectLocation) {
            return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
        }
        else if (renderProps) {
            const rootValue = {};
            if (req.query.q) {
                rootValue.term = 'foot';
            }
            rootValue.term = 'foot';

            const networkLayer = new RelayLocalSchema.NetworkLayer({
                schema,
                rootValue,
                onError: (errors, request) => next(new Error(errors)),
            });
            return Router.prepareData(renderProps, networkLayer).then(({ data, props }) => {
                try {
                    const renderedContent = ReactDOMServer.renderToString(Router.render(props));
                    // const helmet = Helmet.rewind();

                    const renderedPage = renderFullPage(renderedContent, data);
                    return res.send(renderedPage);
                }
                catch (err) {
                    return next(err);
                }
            }, next);
        }
        return next();
    });
});

app.use((err, req, res, next) => {
    console.error("Error!", err, err.stack);
    res.format({
        html: () => {
            res.sendStatus(500);
        },
        json: () => {
            res.status(500).json({
                error: err.message,
            });
        },
    });
});

app.use((req, res, next) => {
    res.format({
        html: () => {
            res.sendStatus(404);
        },
        json: () => {
            res.status(404).json({
                error: 'Not Found',
                status: 404,
            });
        },
    });
});

process.on('uncaughtException', (err) => {
    console.error(err, err.stack);
    process.exit(1);
});

export default app;
