import mongoose from "mongoose";
import ip from "ip";

const RequestSchema = new mongoose.Schema({
    created_date: {type: Date, index: true, "default": Date.now},
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
    this.set("remote_address", ip.toBuffer(value));
});

const Request = mongoose.model("requests", RequestSchema);

export default Request;
