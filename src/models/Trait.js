import mongoose from 'mongoose';

const TraitSchema = new mongoose.Schema({
    _id: { type: String, unique: true, required: true },
    uri: { type: String },
});

TraitSchema.set('toJSON', {
    versionKey: false,
    transform: (document, ret) => {
        ret.id = ret._id;
        delete ret._id;
    },
});

TraitSchema.set('toObject', {
    versionKey: false,
    transform: (document, ret) => {
        ret.id = ret._id;
        delete ret._id;
    },
});

export default mongoose.model('traits', TraitSchema);
