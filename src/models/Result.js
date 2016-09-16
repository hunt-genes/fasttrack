import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
    SNP_ID_CURRENT: { type: String },
    PUBMEDID: { type: String },
    MAPPED_TRAIT: { type: String },
    MAPPED_TRAIT_URI: { type: String },
    SNPS: { type: String },
    CHR_ID: { type: Number, index: true },
    CHR_POS: { type: Number, index: true },
    'DISEASE/TRAIT': { type: String },
    STUDY: { type: String },
    JOURNAL: { type: String },
    'FIRST AUTHOR': { type: String },
    MAPPED_GENE: { type: String, index: true },
    'OR or BETA': { type: String },
    '95% CI (TEXT)': { type: String },
    REGION: { type: String, index: true },
    'P-VALUE': { type: Number, index: true },
    traits: [{ type: String, index: true }],
});

ResultSchema.virtual('strongest_snp_risk_allele').get(function () {
    return this['STRONGEST SNP-RISK ALLELE'];
});

ResultSchema.set('toJSON', {
    versionKey: false,
    transform: (document, ret) => {
        ret.id = ret._id;
        delete ret._id;
    },
});

ResultSchema.set('toObject', {
    versionKey: false,
    transform: (document, ret) => {
        ret.id = ret._id;
        delete ret._id;
    },
});

const Result = mongoose.model('gwas', ResultSchema);

export default Result;
