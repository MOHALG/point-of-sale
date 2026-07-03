const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    hashedPassword: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'cashier'],
      default: 'cashier',
    },

    assignedPos: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pos',
      default: null
      
    }
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject.hashedPassword;
    }
});

module.exports = mongoose.model('User', userSchema);