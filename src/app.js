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

import config from 'config';
import schema from './schema';

import Result from './models/Result';
import Site from './models/Site';
import prepareQuery from './models/prepareQuery';

const app = express();
app.db = db;

/*
function getIP(req) {
    const ips = req.headers['x-forwarded-for'] || // from proxy
        req.connection.remoteAddress || // different versions of node
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    return ips.split(',').pop();
}
*/

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// request logging middleware, logs timestamp, ip and query if defined
/*
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
*/
app.use((req, res, next) => {
    Site.findById('fasttrack').exec().then(site => {
        if (site) {
            req.site = site;
            next();
        }
        else {
            Site.create({_id: 'fasttrack'}).then(site => {
                req.site = site;
                next();
            });
        }
    });
    // TODO: Handle errors
});

// Export data as CSV
app.get('/search/export', (req, res, next) => {
    // query term
    const term = req.query.q || '';

    // If we restrict to tromso imputation data, default: false
    let tromso = false;
    if (req.query.tromso) {
        tromso = JSON.parse(req.query.tromso) || false;
    }

    let hunt = false;
    if (req.query.hunt) {
        hunt = JSON.parse(req.query.hunt) || false;
    }

    // If we restrict to unique SNPs. For export, default is true
    let unique = true;
    if (req.query.unique) {
        unique = JSON.parse(req.query.unique) || false;
    }

    const query = prepareQuery(term, unique, tromso, hunt);
    Result.find(query).exec().then(_results => {
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
            'build37_chr_id',
            'build37_pos',
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

app.post('/order/snps', (req, res, next) => {
    const mappedSnps = req.body.snps.split(',').map(snp => {
        return Result.find({snp_id_current: snp.trim()}, 'genes traits').exec().then(results => {
            let traits = [];
            let genes = [];
            results.forEach(result => {
                traits = traits.concat(result.traits);
                genes = genes.concat(result.genes);
            });
            return {
                snp,
                traits: new Set(traits),
                genes: new Set(genes),
            };
        });
    });
    Promise.all(mappedSnps).then(mappedSnps => {
        const data = mappedSnps.map(mapped => {
            return `${mapped.snp};${Array.from(mapped.genes).join(',')};${Array.from(mapped.traits).join(',')}`;
        }).join('\r\n') + '\r\n';
        res.set('Content-Type', 'text/csv');
        res.set('Content-Disposition', 'attachment; filename=snps.csv');
        res.write(data);
        res.end();
    }).catch(error => {
        console.error('Error: ', error);
    });
});

if (app.settings.env === 'production') {
    app.use(favicon(__dirname + '/assets/favicon.ico'));
}
else {
    app.use(favicon(__dirname + '/assets/favicon.ico'));
}
app.use(express.static(path.join(__dirname, '/assets')));

app.use('/graphql', graphqlHTTP(req => {
    const contextValue = { site: req.site };
    return {
        schema,
        context: contextValue,
        rootValue: contextValue,
        pretty: process.env.NODE_ENV !== 'production',
        graphiql: process.env.NODE_ENV !== 'production',
    }
}));

function renderFullPage(renderedContent, initialState, head = {
    title: '<title>Fast-track</title>',
    meta: '<meta name="viewport" content="width=device-width, initial-scale=1" />',
}) {
    let style = '';
    if (config.get('html.style')) {
        style = `<link rel="stylesheet" href="${config.prefix}/stylesheet.css">`;
    }
    return `
    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8" />
        ${head.title}
        ${head.meta}
        ${style}
    </head>
    <body>
        <div id="app">${renderedContent}</div>
        <script>
            window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
        </script>
        <script src="${config.prefix}/javascript.js"></script>
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
            const contextValue = { site: req.site };
            const networkLayer = new RelayLocalSchema.NetworkLayer({
                schema,
                contextValue,
                rootValue: contextValue,
                onError: (errors, request) => next(new Error(errors)),
            });
            return Router.prepareData(renderProps, networkLayer).then(({ data, props }) => {
                try {
                    global.navigator = { userAgent: req.headers['user-agent'] };
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
            res.status(500).send(err.message);
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
