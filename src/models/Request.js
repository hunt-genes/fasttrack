import mongoose from 'mongoose';
import ip from 'ip';

const RequestSchema = new mongoose.Schema({
    created_date: { type: Date, index: true, 'default': Date.now },
    remote_address: { type: Buffer, required: true, index: true },
    query: { type: String },
});

const options = {
    versionKey: false,
    virtuals: true,
};

RequestSchema.set('toObject', options);
RequestSchema.set('toJSON', options);
RequestSchema.virtual('_type').get(() => 'Request');
RequestSchema
.virtual('ip')
.get(function get() {
    return ip.toString(this.remote_address);
})
.set(function set(value) {
    this.set('remote_address', ip.toBuffer(value));
});

export default mongoose.model('Request', RequestSchema);
