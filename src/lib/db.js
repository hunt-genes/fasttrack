import mongoose from 'mongoose';
import Promise from 'bluebird';

mongoose.Promise = Promise;

let dbName = 'fasttrack';
if (process.env.NODE_ENV === 'test') {
    dbName = 'test';
}
const db = mongoose.connect(`mongodb://localhost/${dbName}`);

export default db;
