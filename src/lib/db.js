import mongoose from 'mongoose';
import Promise from 'bluebird';

mongoose.Promise = Promise;


let db;
if (process.env.NODE_ENV === 'test') {
    db = mongoose.connect('mongodb://localhost/mocha_test');
}
else {
    db = mongoose.connect('mongodb://localhost/fasttrack');
}

export default db;
