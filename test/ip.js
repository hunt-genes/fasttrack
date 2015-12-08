import Request from "../src/models/Request";
import ValidationError from "mongoose/lib/error/validation";
import ip from "ip";

describe("Request", () => {
    describe("when saving", () => {
        let request_result;
        it("should be saved", (done) => {
            let request = new Request({
                ip: "127.0.0.2",
                created_date: new Date()
            });
            request.save((err, request) => {
                expect(err).to.be.null;
                done();
            });
        });
        it("should be found by buffer value", (done) => {
            Request.findOne({
                remote_address: ip.toBuffer("127.0.0.2")
            }).exec((err, request) => {
                expect(err).to.be.null;
                request_result = request;
                done();
            });
        });
        it("should have correct IP virtual set", () => {
            expect(request_result.ip).to.equal("127.0.0.2");
        });
        it("should be able to set query property", (done) => {
            request_result.query = "ost";
            request_result.save((err) => {
                expect(err).to.be.null;
                done();
            });
        });
        it("should be found by query property", (done) => {
            Request.findOne({query: "ost"}).exec((err, request) => {
                expect(err).to.be.null;
                done();
            });
        });
    });
});
