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
    'P-VALUE (TEXT)': { type: String },
    traits: [{ type: String, index: true }],
    imputed: {
        tromso: {
            REF: { type: String },
            ALT: { type: String },
            MAF: { type: String },
            AvgCall: { type: Number },
            Rsq: { type: Number },
            Genotyped: { type: Boolean },
            LooRsq: { type: Number },
            EmpR: { type: Number },
            EmpRsq: { type: Number },
            Dose0: { type: Number },
            Dose1: { type: Number },
        },
    },
    CONTEXT: { type: String },
    'DATE ADDED TO CATALOG': { type: String },
});

ResultSchema.virtual('strongest_snp_risk_allele').get(function () {
    return this['STRONGEST SNP-RISK ALLELE'];
});
ResultSchema.virtual('or_or_beta').get(function () {
    return this['OR or BETA'];
});
ResultSchema.virtual('p_value').get(function () {
    return this['P-VALUE'];
});
ResultSchema.virtual('p_value_text').get(function () {
    return this['P-VALUE (TEXT)'];
});
ResultSchema.virtual('p95_ci').get(function () {
    return this['95% CI (TEXT)'];
});
ResultSchema.virtual('date_added_to_catalog').get(function () {
    return this['DATE ADDED TO CATALOG'];
});
ResultSchema.virtual('first_author').get(function () {
    return this['FIRST AUTHOR'];
});

ResultSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (document, ret) => {
        ret.id = ret._id;
        delete ret._id;
    },
});

ResultSchema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: (document, ret) => {
        ret.id = ret._id;
        delete ret._id;
    },
});

const Result = mongoose.model('gwas', ResultSchema);

export default Result;
