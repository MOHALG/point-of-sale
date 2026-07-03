const mongoose = require ('mongoose');

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        pos: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pos',
            required: true
        },

        description: {
            type: String,
            trim: true,
        },

        unitOfMeasurement: {
            type: String,
            trim: true,
        },
        itemCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ItemCategory',
        },
        

    },
    { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);

