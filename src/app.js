import path from "path";
import express from "express";
import csv from "fast-csv";
import favicon from "serve-favicon";
import ip from "ip";
import React from "react";
import ReactDOMServer from "react-dom/server";
import Iso from "iso";
import alt from "./alt";
import Result from "./models/Result";
import Trait from "./models/Trait";
import Request from "./models/Request";
import db from "./lib/db";
import routes from "./routes";
import { RoutingContext, match } from "react-router";
import { map, startsWith, endsWith } from "lodash";

const app = express();
app.db = db;

function getIP(req) {
    const ips = req.headers["x-forwarded-for"] || // from proxy
        req.connection.remoteAddress || // different versions of node
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    return ips.split(",").pop();
}

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

app.get("/traits", (req, res, next) => {
    Trait.find().sort("_id").exec((err, traits) => {
        if (err) { return next(err); }
        res.json({ traits });
    });
});

app.get("/requests", (req, res, next) => {
    Request.count().exec((err, totalRequests) => {
        if (err) { return next(err); }
        const localStart = ip.toBuffer("129.241.0.0");
        const localEnd = ip.toBuffer("129.241.255.255");
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

app.get("/search/", (req, res, next) => {
    let download = false;
    const query = {};
    const fields = [];

    // query param handling

    // filter on values known in hunt
    let hunt = JSON.parse(req.query.hunt || "false");

    let q = req.query.q;
    if (q && q.length < 3) {
        q = "";
    }
    if (q) {
        if (endsWith(q, ".csv")) {
            q = q.replace(/\.csv$/, "");
            download = true;
        }
        // TODO: Should we fix the SNP field to be an integer? YES, it's not
        // even working normally now, but that may be a different issue.
        if (!isNaN(q)) {
            fields.push({ PUBMEDID: q });
            fields.push({ SNPS: "rs" + q });
        }
        else if (startsWith(q, "chr")) {
            let [chrid, chrpos] = q.split(":", 2);
            chrid = chrid.replace("chr", "");
            query.CHR_ID = +chrid;
            query.CHR_POS = +chrpos;
        }
        else if (startsWith(q, "rs")) {
            /*
            q = q.replace("rs", "");
            if (!isNaN(q)) {
                fields.push({SNP_ID_CURRENT: q});
            }
            */
            fields.push({ SNPS: q });
        }
        else {
            const r = RegExp(q, "i");
            fields.push({ REGION: { $regex: r } });
            fields.push({ "FIRST AUTHOR": { $regex: r } });
            fields.push({ traits: { $regex: r } });
            fields.push({ "DISEASE/TRAIT": { $regex: r } });
            fields.push({ "MAPPED_GENE": { $regex: r } });
        }
    }
    if (fields.length) {
        query.$or = fields;
    }
    if (hunt) {
        query.hunt = { $exists: 1 };
    }
    query["P-VALUE"] = { $lt: 0.00000005, $exists: 1, $ne: null };

    Result.aggregate({ $match: query }, { $group: { _id: "$SNP_ID_CURRENT", count: { $sum: 1 } } }).exec((err, count) => {
        if (err) { return next(err); }

        const different = count.length;
        const total = count.reduce((previous, current) => {
            return previous + current.count;
        }, 0);

        if (q) {
            Result.find(query).limit(1000).sort("CHR_ID CHR_POS").lean().exec((err, results) => {
                if (err) { return next(err); }
                if (download) {
                    results = map(results, (result) => {
                        result.SNP_ID_CURRENT = `rs${result.SNP_ID_CURRENT}`;
                        result["STRONGEST SNP-RISK ALLELE"] = result["STRONGEST SNP-RISK ALLELE"].split("-").pop();
                        return result;
                    });
                    csv.writeToString(results, { headers: ["SNP_ID_CURRENT", "CHR_ID", "CHR_POS", "STRONGEST SNP-RISK ALLELE", "P-VALUE", "OR or BETA", "95% CI (TEXT)"], delimiter: "\t" }, (err, data) => {
                        res.set("Content-Type", "text/tsv");
                        res.set("Content-Disposition", `attachment; filename=export-${q}.csv`);
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

if (app.settings.env === "production") {
    app.use(favicon(__dirname + "/../dist/favicon.ico"));
}
else {
    app.use(favicon(__dirname + "/../src/favicon.ico"));
}
app.use(express.static(path.join(__dirname, "..", "dist")));

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
            res.status(404).send("Not found");
        }
    });
});

export default app;
