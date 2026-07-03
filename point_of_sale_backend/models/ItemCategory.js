const mongoose = require ('mongoose');

const itemCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
        },
            pos: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pos',
            required: true
        },

        items: [{
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        }],

        
    },
    { timestamps: true }
);

module.exports = mongoose.model('ItemCategory', itemCategorySchema);
