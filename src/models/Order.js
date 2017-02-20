import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    project: { type: String },
    email: { type: String },
    comment: { type: String },
    snps: [{ type: String }],
});

const options = {
    versionKey: false,
    virtuals: true,
};

OrderSchema.set('toJSON', options);
OrderSchema.set('toObject', options);
OrderSchema.set('timestamps', true);
OrderSchema.virtual('_type').get(() => {
    return 'Order';
});

export default mongoose.model('Order', OrderSchema);
