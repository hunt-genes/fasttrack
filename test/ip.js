/* eslint-env nodejs, mocha  */
/* global describe:false, expect:false */

import Request from "../src/models/Request";
import ip from "ip";

describe("Request", () => {
    describe("when saving", () => {
        let requestResult;
        it("should be saved", (done) => {
            const request = new Request({
                ip: "127.0.0.2",
                created_date: new Date()
            });
            request.save((err) => {
                expect(err).to.be.null;
                done();
            });
        });
        it("should be found by buffer value", (done) => {
            Request.findOne({
                remote_address: ip.toBuffer("127.0.0.2")
            }).exec((err, request) => {
                expect(err).to.be.null;
                requestResult = request;
                done();
            });
        });
        it("should have correct IP virtual set", () => {
            expect(requestResult.ip).to.equal("127.0.0.2");
        });
        it("should be able to set query property", (done) => {
            requestResult.query = "ost";
            requestResult.save((err) => {
                expect(err).to.be.null;
                done();
            });
        });
        it("should be found by query property", (done) => {
            Request.findOne({query: "ost"}).exec((err) => {
                expect(err).to.be.null;
                done();
            });
        });
    });
});
