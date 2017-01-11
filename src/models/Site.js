import mongoose from 'mongoose';

const SiteSchema = new mongoose.Schema({
    _id: { type: String, unique: true, required: true },
});

SiteSchema.set('toJSON', {
    versionKey: false,
    transform: (document, ret) => {
        ret.id = ret._id;
        delete ret._id;
    },
});

SiteSchema.set('toObject', {
    versionKey: false,
    transform: (document, ret) => {
        ret.id = ret._id;
        delete ret._id;
    },
});

export default mongoose.model('Site', SiteSchema);
