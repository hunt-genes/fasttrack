import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
    SNP_ID_CURRENT: { type: String },
    PUBMEDID: { type: String },
    MAPPED_TRAIT: { type: String },
    MAPPED_TRAIT_URI: { type: String },
    SNPS: { type: String },
    CHR_ID: { type: Number },
    CHR_POS: { type: Number },
    "DISEASE/TRAIT": { type: String },
    STUDY: { type: String },
    JOURNAL: { type: String },
    "FIRST AUTHOR": { type: String },
    MAPPED_GENE: { type: String },
    "OR or BETA": { type: String },
    "95% CI (TEXT)": { type: String },
    // hunt and p-value gives problems for mongoose
});

const Result = mongoose.model("gwas", ResultSchema);

export default Result;
