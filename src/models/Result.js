import mongoose from "mongoose";

let ResultSchema = new mongoose.Schema({
    SNP_ID_CURRENT: {type: Number},
    PUBMEDID: {type: Number},
    MAPPED_TRAIT: {type: String},
    MAPPED_TRAIT_URI: {type: String},
    SNPS: {type: String},
    CHR_ID: {type: String},
    "DISEASE/TRAIT": {type: String},
    STUDY: {type: String},
    JOURNAL: {type: String},
    "FIRST AUTHOR": {type: String}
});

let Result = mongoose.model("gwas", ResultSchema);

export default Result;
