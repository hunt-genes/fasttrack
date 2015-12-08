import path from "path";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import csv from "fast-csv";
import favicon from "serve-favicon";
import React from "react";
import ReactDOMServer from "react-dom/server";
import Iso from "iso";
import alt from "./alt";
import Result from "./models/Result";
import Trait from "./models/Trait";
import Request from "./models/Request";
import db from "./lib/db";
var routes = require("./routes");
var ReactRouter = require("react-router");
var RoutingContext = ReactRouter.RoutingContext;
var match = ReactRouter.match;

let app = express();
app.db = db;

function getIP(req) {
    let ips = req.headers['x-forwarded-for'] || // from proxy
        req.connection.remoteAddress || // different versions of node
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    return ips.split(",").pop();
}

// request logging middleware, logs timestamp, ip and query if defined
app.use((req, res, next) => {
    let q = req.params.q || req.query.q;

    if (q) {
        let ip = getIP(req);
        let request = new Request();
        request.ip = ip;
        request.query = q;
        request.save((err) => {
            if (err) { console.error(err) };
        });
    }

    // do not wait for request logger
    next();
});

app.get("/search/:q?", (req, res, next) => {
    let download = false;
    let query = {};
    let fields = [];
    let q = req.params.q || req.query.q;
    if (q && q.length < 3) {
        q = "";
    }
    if (q) {
        if (q.endsWith(".csv")) {
            q = q.replace(/\.csv$/, "");
            download = true;
        }
        // TODO: Should we fix the SNP field to be an integer? YES, it's not
        // even working normally now, but that may be a different issue.
        if (!isNaN(q)) {
            fields.push({PUBMEDID: q});
            fields.push({SNPS: "rs" + q});
        }
        else if (q.startsWith("chr")) {
            var [chrid, chrpos] = q.split(":", 2);
            chrid = chrid.replace("chr", "");
            query.CHR_ID = +chrid;
            query.CHR_POS = +chrpos;
        }
        else if (q.startsWith("rs")) {
            /*
            q = q.replace("rs", "");
            if (!isNaN(q)) {
                fields.push({SNP_ID_CURRENT: q});
            }
            */
            fields.push({SNPS: q});
        }
        else {
            var r = RegExp(q, "i");
            fields.push({REGION: {$regex: r}});
            fields.push({"FIRST AUTHOR": {$regex: r}});
            fields.push({traits: {$regex: r}});
            fields.push({"DISEASE/TRAIT": {$regex: r}});
            fields.push({"MAPPED_GENE": {$regex: r}});
        }
    }
    if (fields.length) {
        query["$or"] = fields
    }
    if (true) {
        query["hunt"] = {$exists: 1};
        query["P-VALUE"] = {$lt: 0.00000005, $exists: 1, $ne: null};
    }
    console.log("q", q, query, typeof(q));
    Trait.find().sort("_id").exec((err, traits) => {
        if (err) { return err; }
        Result.aggregate({$match: query}, {$group: {_id: "$SNP_ID_CURRENT", count: {$sum: 1}}}).exec((err, count) => {
            if (err) { return err; }

            const different = count.length;
            const total = count.reduce((previous, current) => {
                return previous + current.count;
            }, 0);

            console.log(different, total);

            if (q) {
                Result.find(query).limit(1000).sort("CHR_ID CHR_POS").lean().exec((err, results) => {
                    if (err) { return err; }
                    if (download) {
                        csv.writeToString(results, {headers: true, delimiter: "\t"}, (err, data) => {
                            res.set("Content-Type", "text/tsv");
                            res.set("Content-Disposition", `attachment; filename=export-${q}.csv`);
                            res.write(data);
                            res.end();
                        });
                    }
                    else {
                        res.format({
                            html: () => {
                                res.locals.data = { GwasStore: {results: results, different: different, total: total, query: q, traits: traits}};
                                next();
                            },
                            json: () => {
                                res.json({results: results, different: different, total: total, query: q, traits: traits});
                            }
                        });
                    }
                });
            }
            else {
                res.format({
                    html: () => {
                        res.locals.data = { GwasStore: {results: [], different: different, total: total, query: q, traits: traits}};
                        next();
                    },
                    json: () => {
                        res.json({results: [], different: different, total: total, query: q, traits: traits});
                    }
                });
            }
        });
    });
});
if (app.settings.env === 'production'){
    app.use(favicon(__dirname + '/../dist/favicon.ico'));
}
else {
    //app.use(favicon(__dirname + '/../src/favicon.ico'));
}
app.use(express.static(path.join(__dirname, '..', 'dist')))

app.use((req, res) => {
    alt.bootstrap(JSON.stringify(res.locals.data || {}));
    //console.log(routes);
    match({routes: routes, location: req.url}, (err, redirectLocation, renderProps) => {
        if (err) {
            res.status(500).send(err.message);
        }
        else if (redirectLocation) {
            res.redirect(302, redirectLocation.pathname + redirectLocation.search);
        }
        else if (renderProps) {
            var iso = new Iso();
            var content = ReactDOMServer.renderToString(<RoutingContext {...renderProps} />);
            iso.add(content, alt.flush());

            var markup = `<!doctype html><html><head><meta charset="utf-8" /><title>GWASC</title><meta name="viewport" content="width=device-width, initial-scale=1.0" /><link href="/stylesheet.css" rel="stylesheet" /></head><body>${iso.render(content)}<script src="/client.js"></script></body></html>`;
            res.write(markup);
            res.end();
        }
        else {
            res.status(404).send('Not found');
        }
    });
});

export default app;
