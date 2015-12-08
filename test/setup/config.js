import mongoose from "mongoose";
import chai from "chai";

import app from "../../src/app";
import db from "../../src/lib/db";

app.db = db;

global.app = app;
global.expect = chai.expect;
