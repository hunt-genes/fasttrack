import mongoose from 'mongoose';

const TraitSchema = new mongoose.Schema({
    _id: { type: String, unique: true, required: true },
    uri: { type: String },
});

const options = {
    versionKey: false,
    virtuals: true,
};

TraitSchema.set('toJSON', options);
TraitSchema.set('toObject', options);
TraitSchema.virtual('_type').get(() => {
    return 'Trait';
});

export default mongoose.model('traits', TraitSchema);
