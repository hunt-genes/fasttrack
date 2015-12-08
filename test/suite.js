import mongoose from "mongoose";

// global before function
before('global', function(done) {
    // wait a bit to make sure db connections are done ...
    setTimeout(function() {
        done();
    }, 100);
});

// global after function
after('global', function(done) {
    if (mongoose.connection.db) {
        mongoose.connection.db.dropDatabase(function() {
            done();
        });
    }
    else {
        done();
    }
});
