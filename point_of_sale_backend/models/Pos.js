const mongoose = require('mongoose');

const posSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    paymentMethods: [{
        type: String,
        trim: true,
    }],


  },
  { timestamps: true }
);

module.exports = mongoose.model('Pos', posSchema);