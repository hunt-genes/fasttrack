import mongoose from "mongoose";

let db;
if (process.env.NODE_ENV === 'test') {
    db = mongoose.connect("mongodb://localhost/mocha_test");
}
else {
    db = mongoose.connect("mongodb://localhost/gwasc");
}

export default db;
