import mongoose from 'mongoose';

const SiteSchema = new mongoose.Schema({
    _id: { type: String, unique: true, required: true },
});

const options = {
    versionKey: false,
    virtuals: true,
};

SiteSchema.set('toJSON', options);
SiteSchema.set('toObject', options);
SiteSchema.virtual('_type', () => {
    return 'Site';
});

export default mongoose.model('Site', SiteSchema);
