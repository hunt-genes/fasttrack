import mongoose from "mongoose";

const TraitSchema = new mongoose.Schema({
    _id: {type: String, unique: true, required: true},
    uri: {type: String}
});

const Trait = mongoose.model("traits", TraitSchema);

export default Trait;
