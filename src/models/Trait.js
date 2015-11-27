import mongoose from "mongoose";

let TraitSchema = new mongoose.Schema({
    _id: {type: String, unique: true, required: true},
    uri: {type: String}
});

let Trait = mongoose.model("traits", TraitSchema);

export default Trait;
