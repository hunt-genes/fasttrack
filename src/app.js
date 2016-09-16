import path from 'path';
import express from 'express';
import csv from 'fast-csv';
import favicon from 'serve-favicon';
import ip from 'ip';
import ReactDOMServer from 'react-dom/server';
import Result from './models/Result';
import Trait from './models/Trait';
import Request from './models/Request';
import db from './lib/db';
import routes from './routes';
import { map, startsWith, endsWith, each, values } from 'lodash';
import bodyParser from 'body-parser';
import moment from 'moment';
import Router from 'isomorphic-relay-router';
import RelayLocalSchema from 'relay-local-schema';
// import Helmet from 'react-helmet';
import { match } from 'react-router';
import graphqlHTTP from 'express-graphql';
import schema from './schema';

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

app.get('/traits', (req, res, next) => {
    Trait.find().sort('_id').exec((err, traits) => {
        if (err) { return next(err); }
        res.json({ traits });
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

app.get('/requests', (req, res, next) => {
    Request.count().exec((err, totalRequests) => {
        if (err) { return next(err); }
        const localStart = ip.toBuffer('129.241.0.0');
        const localEnd = ip.toBuffer('129.241.255.255');
        Request.count({
            $and: [
                { remote_address: { $gte: localStart } },
                { remote_address: { $lte: localEnd } },
            ],
        }).exec((err, localRequests) => {
            const requests = {
                total: totalRequests,
                local: localRequests,
            };
            if (err) { return next(err); }
            res.format({
                html: () => {
                    res.locals.data = { GwasStore: {
                        requests,
                    } };
                    next();
                },
                json: () => {
                    res.json({
                        requests,
                    });
                },
            });
        });
    });
});

app.get('_/search/', (req, res, next) => {
    let download = false;
    const query = {};
    const fields = [];

    // query param handling

    // filter on values known in tromso
    const tromso = JSON.parse(req.query.tromso || 'false');
    const unique = JSON.parse(req.query.unique || 'false');

    let q = req.query.q;
    if (q && q.length < 3) {
        q = '';
    }
    if (q) {
        if (endsWith(q, '.csv')) {
            q = q.replace(/\.csv$/, '');
            download = true;
        }
        // TODO: Should we fix the SNP field to be an integer? YES, it's not
        // even working normally now, but that may be a different issue.
        const chrSearch = q.match(/^chr(\w+):(\d+)$/);
        if (!isNaN(q)) {
            fields.push({ PUBMEDID: q });
            fields.push({ SNPS: 'rs' + q });
        }
        else if (chrSearch) {
            const [_, chrid, chrpos] = chrSearch;
            query.CHR_ID = +chrid;
            query.CHR_POS = +chrpos;
        }
        else if (startsWith(q, 'rs')) {
            /*
            q = q.replace("rs", "");
            if (!isNaN(q)) {
                fields.push({SNP_ID_CURRENT: q});
            }
            */
            fields.push({ SNPS: q });
        }
        else {
            const r = RegExp(q, 'i');
            fields.push({ REGION: { $regex: r } });
            fields.push({ 'FIRST AUTHOR': { $regex: r } });
            fields.push({ traits: { $regex: r } });
            fields.push({ 'DISEASE/TRAIT': { $regex: r } });
            fields.push({ 'MAPPED_GENE': { $regex: r } });
        }
    }
    if (fields.length) {
        query.$or = fields;
    }
    if (tromso) {
        query.imputed = { $exists: 1 };
    }
    query['P-VALUE'] = { $lt: 0.00000005, $exists: 1, $ne: null };

    Result.aggregate({ $match: query }, { $group: { _id: '$SNP_ID_CURRENT', count: { $sum: 1 } } }).exec((err, count) => {
        if (err) { return next(err); }

        const different = count.length;
        const total = count.reduce((previous, current) => {
            return previous + current.count;
        }, 0);

        if (q) {
            Result.find(query).limit(1000).sort('CHR_ID CHR_POS').lean().exec((err, results) => {
                if (err) { return next(err); }
                if (unique) {
                    const rsids = {};
                    each(results, result => {
                        const rsid = result.SNP_ID_CURRENT;
                        if (rsids[rsid]) {
                            const oldres = rsids[rsid];

                            const oldP = oldres['P-VALUE'];
                            const newP = result['P-VALUE'];

                            if (!newP) {
                                return;
                            }

                            const oldDate = moment(oldres.DATE, 'DD-MMM-YYYY');
                            const newDate = moment(result.DATE, 'DD-MMM-YYYY');

                            if (newDate.isBefore(oldDate)) {
                                return;
                            }

                            if (newDate.isSame(oldDate)) {
                                if (newP > oldP) {
                                    return;
                                }
                            }
                        }
                        rsids[rsid] = result;
                    });

                    results = values(rsids); // eslint-disable-line no-param-reassign
                }
                if (download) {
                    results = map(results, (result) => {
                        result.SNP_ID_CURRENT = `rs${result.SNP_ID_CURRENT}`;
                        result['STRONGEST SNP-RISK ALLELE'] = result['STRONGEST SNP-RISK ALLELE'].split('-').pop();
                        return result;
                    });
                    csv.writeToString(results, { headers: ['SNP_ID_CURRENT', 'CHR_ID', 'CHR_POS', 'STRONGEST SNP-RISK ALLELE', 'P-VALUE', 'OR or BETA', '95% CI (TEXT)', 'RISK ALLELE FREQUENCY', 'hg19chr', 'hg19pos', 'MAPPED_GENE', 'INITIAL SAMPLE DESCRIPTION', 'REPLICATION SAMPLE DESCRIPTION', 'DATE'], delimiter: '\t' }, (err, data) => {
                        res.set('Content-Type', 'text/csv');
                        res.set('Content-Disposition', `attachment; filename=export-${q.replace(/[^a-zA-Z0-9]/g, '-')}.csv`);
                        res.write(data);
                        res.end();
                    });
                }
                else {
                    res.format({
                        html: () => {
                            res.locals.data = { GwasStore: {
                                results: { different, total, data: results },
                            } };
                            next();
                        },
                        json: () => {
                            res.json({
                                results: { different, total, data: results },
                            });
                        },
                    });
                }
            });
        }
        else {
            res.format({
                html: () => {
                    res.locals.data = { GwasStore: {
                        results: { different, total, data: [] },
                    } };
                    next();
                },
                json: () => {
                    res.json({
                        results: { different, total, data: [] },
                    });
                },
            });
        }
    });
});

if (app.settings.env === 'production') {
    app.use(favicon(__dirname + '/../dist/favicon.ico'));
}
else {
    app.use(favicon(__dirname + '/../src/favicon.ico'));
}
app.use(express.static(path.join(__dirname, '..', 'dist')));

/*
app.use((req, res) => {
    alt.bootstrap(JSON.stringify(res.locals.data || {}));
    match({ routes, location: req.url }, (err, redirectLocation, renderProps) => {
        if (err) {
            res.status(500).send(err.message);
        }
        else if (redirectLocation) {
            res.redirect(302, redirectLocation.pathname + redirectLocation.search);
        }
        else if (renderProps) {
            const iso = new Iso();
            const content = ReactDOMServer.renderToString(<RoutingContext {...renderProps} />);
            iso.add(content, alt.flush());

            const markup = `<!doctype html><html><head><meta charset="utf-8" /><title>GWASC</title><meta name="viewport" content="width=device-width, initial-scale=1.0" /><link href="/stylesheet.css" rel="stylesheet" /></head><body>${iso.render(content)}<script src="/client.js"></script></body></html>`;
            res.write(markup);
            res.end();
        }
        else {
            res.status(404).send('Not found');
        }
    });
});
*/

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
    console.error("Error!", err);
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
    console.error(err);
    process.exit(1);
});

export default app;
