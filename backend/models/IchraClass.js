// backend/models/IchraClass.js

const mongoose = require('mongoose');

const ichraClassSchema = new mongoose.Schema({
    group_id: {type: mongoose.Schema.Types.ObjectId,ref: 'Group', required: true},
    class_name: { type: String,required: true},
    subclass_name: {type: String},
    contribution: {
        employee: {type: Number,required: true},
        dependents: {type: Number,required: true}
    },
    created_at: {type: Date,default: Date.now}
});

module.exports = mongoose.model('IchraClass', ichraClassSchema);