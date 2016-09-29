import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
    snp_id_current: { type: String },
    pubmedid: { type: String },
    mapped_trait: { type: String },
    mapped_trait_uri: { type: String },
    snps: { type: String },
    chr_id: { type: Number, index: true },
    chr_pos: { type: Number, index: true },
    disease_trait: { type: String },
    study: { type: String },
    journal: { type: String },
    first_author: { type: String },
    mapped_gene: { type: String, index: true },
    or_or_beta: { type: String },
    p95_ci_text: { type: String },
    region: { type: String, index: true },
    p_value: { type: Number, index: true },
    p_value_text: { type: String },
    strongest_snp_risk_allele: { type: String },
    context: { type: String },
    date_added_to_catalog: { type: String },
    date: { type: String },
    traits: [{ type: String, index: true }],
    genes: [{ type: String, index: true }],
    best_for_unique: { type: Boolean },
    interactions: [{
        chr_id: { type: Number },
        chr_pos: { type: Number },
        snps: { type: String },
        region: { type: String },
        strongest_snp_risk_allele: { type: String },
        reported_gene_s: { type: String },
        mapped_gene: { type: String },
    }],
    tromso: {
        ref: { type: String },
        alt: { type: String },
        maf: { type: String },
        avgcall: { type: Number },
        rsq: { type: Number },
        genotyped: { type: Boolean },
    },
    hunt: {
        ref: { type: String },
        alt: { type: String },
        maf: { type: String },
        avgcall: { type: Number },
        rsq: { type: Number },
        genotyped: { type: Boolean },
    },
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

const Result = mongoose.model('Result', ResultSchema, 'gwas');

export default Result;
