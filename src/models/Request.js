import mongoose from "mongoose";
import ip from "ip";

let RequestSchema = new mongoose.Schema({
    created_date: {type: Date, required: true, index: true},
    remote_address: {type: Buffer, required: true, index: true},
    query: {type: String}
}, {
    toObject: {
        virtuals: true,
    },
    toJSON: {
        virtuals: true,
    },
});

RequestSchema
.virtual("ip")
.get(function () {
    return ip.toString(this.remote_address);
})
.set(function (value) {
    try {
        this.set("remote_address", ip.toBuffer(value));
    }
    catch (e) {
        console.error(e);
        throw new TypeError(`${value} is not parseable`);
    }
});

let Request = mongoose.model("requests", RequestSchema);

export default Request;
