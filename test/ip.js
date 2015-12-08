import Request from "../src/models/Request";

describe("Request", () => {
    before((done) => {
        setTimeout(function() {
        app.db.connection.db.dropDatabase(() => {
            done();
        });
        }, 10);
    });
    describe("IP", () => {
        it("should be saved and retrieved", (done) => {
            let request = new Request({
                ip: "127.0.0.1",
                created_date: new Date()
            });
            request.save((err) => {
                expect(err).to.be.null;
                Request.findOne().exec((err, request) => {
                    expect(err).to.be.null;
                    expect(request.ip).to.equal("127.0.0.1");
                    done();
                });
            });
        });
        it.skip("should throw error when not valid", (done) => {
            let request = new Request({
                ip: 1271,
                created_date: new Date()
            });
            expect(request.save()).to.be.rejectedWith(Error);
            done();
        });
    });
});
