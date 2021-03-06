/* eslint "no-console": 0 */
/* eslint "no-param-reassign": 0 */

import bodyParser from 'body-parser';
import config from 'config';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import csv from 'fast-csv';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Router from 'isomorphic-relay-router';
import path from 'path';
import ReactDOMServer from 'react-dom/server';
// import Helmet from 'react-helmet';
import { match } from 'react-router';
import RelayLocalSchema from 'relay-local-schema';
import prefix from './prefix';
import schema from './schema';
import Request from './models/Request';
import db from './lib/db';
import routes from './routes';
import prepareQuery from './models/prepareQuery';
import Result from './models/Result';
import Site from './models/Site';

injectTapEventPlugin();

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
/*
app.use((req, res, next) => {
    const q = req.query.q;

    if (q) {
        const ip = getIP(req);
        const request = new Request();
        request.ip = ip;
        request.query = q;
        request.save((err) => {
            if (err) {
                return next(err);
            }
            return undefined;
        });
    }

    // do not wait for request logger
    next();
});
*/
app.use((req, res, next) => {
    Site.findById('fasttrack').exec().then((site) => {
        if (site) {
            req.site = site;
            next();
        }
        else {
            Site.create({ _id: 'fasttrack' }).then((_site) => {
                req.site = _site;
                next();
            });
        }
    });
    // TODO: Handle errors
});

// Export data as CSV
app.get(`${prefix}/export`, (req, res, next) => {
    // query term
    const term = req.query.q || '';

    const format = req.query.format || 'tsv';

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
    Result.find(query).exec().then((_results) => {
        const results = _results.map((_result) => {
            const result = _result.toObject();
            result.mapped_genes = result.genes;
            delete result.genes;
            return result;
        });
        const delimiter = format === 'csv' ? ';' : '\t';
        csv.writeToString(results, {
            headers: [
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
            ],
            delimiter,
            quote: '"',
        }, (err, data) => {
            if (format === 'csv') {
                res.set('Content-Type', 'text/csv');
            }
            else {
                res.set('Content-Type', 'text/tab-separated-values');
            }

            res.set(
                'Content-Disposition',
                `attachment; filename=export-${term.replace(/[^a-zA-Z0-9]+/g, '-')}.${format}`,
            );
            res.write(data);
            res.end();
        });
    });
});

app.post(`${prefix}/snps`, (req, res, next) => {
    const mappedSnps = req.body.snps.split(',').map((snp) => {
        return Result.find({ snp_id_current: snp.trim() }, 'genes traits').exec().then((results) => {
            let traits = [];
            let genes = [];
            results.forEach((result) => {
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
    Promise.all(mappedSnps).then((results) => {
        const joinedResults = results.map((mapped) => {
            const joinedGenes = Array.from(mapped.genes).join(',');
            const joinedTraits = Array.from(mapped.traits).join(',');
            return `${mapped.snp};${joinedGenes};${joinedTraits}`;
        }).join('\r\n');
        const data = `${joinedResults}\r\n`;
        res.set('Content-Type', 'text/csv');
        res.set('Content-Disposition', 'attachment; filename=snps.csv');
        res.write(data);
        res.end();
    }).catch((error) => {
        console.error('Error: ', error);
    });
});

app.use(`${prefix}/static`, express.static(path.join(__dirname, '/static')));

app.use(`${prefix}/graphql`, graphqlHTTP((req) => {
    const contextValue = { site: req.site };
    return {
        schema,
        context: contextValue,
        rootValue: contextValue,
        pretty: process.env.NODE_ENV !== 'production',
        graphiql: process.env.NODE_ENV !== 'production',
    };
}));

function renderFullPage(renderedContent, initialState, head = {
    title: '<title>Fast-track</title>',
    meta: '<meta name="viewport" content="width=device-width, initial-scale=1" />',
}) {
    let style = '';
    if (config.get('html.style')) {
        style = `<link rel="stylesheet" href="${prefix}/static/stylesheet.css">`;
    }
    return `
    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        ${head.title}
        ${head.meta}
        ${style}
    </head>
    <body>
        <div id="app">${renderedContent}</div>
        <script>
            window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
        </script>
        <script src="${prefix}/static/javascript.js"></script>
    </body>
    </html>
    `;
}

/** Universal app endpoint **/
app.get(`${prefix}*`, (req, res, next) => {
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
                onError: (errors, request) => {
                    return next(new Error(errors));
                },
            });
            return Router.prepareData(renderProps, networkLayer).then(({ data, props }) => {
                try {
                    global.navigator = { userAgent: req.headers['user-agent'] };
                    const renderedContent = ReactDOMServer.renderToString(Router.render(props));
                    // const helmet = Helmet.rewind();

                    const renderedPage = renderFullPage(renderedContent, data);
                    return res.send(renderedPage);
                }
                catch (_err) {
                    return next(_err);
                }
            }, next);
        }
        return next();
    });
});

app.use((err, req, res, next) => {
    console.error('Error!', err, err.stack);
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
