import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    email: { type: String },
    snps: [{ type: String }],
}, { timestamps: true });

OrderSchema.set('toJSON', {
    versionKey: false,
    transform: (document, ret) => {
        ret.id = ret._id;
        delete ret._id;
    },
});

OrderSchema.set('toObject', {
    versionKey: false,
    transform: (document, ret) => {
        ret.id = ret._id;
        delete ret._id;
    },
});

export default mongoose.model('Order', OrderSchema);
