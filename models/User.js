const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'A name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'A Password is required'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A Confirm Password is required'],
    validate: {
      //Works on save only
      validator: function (val) {
        return val === this.password;
      },
      message: "Password does'nt Match",
    },
  },
  mobile: {
    type: Number,
    required: [true, 'Mobile Number is Required'],
  },
  address: {
    type: String,
    required: [true, 'A Addresss is Required'],
  },
});

userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (candiPass, userPass) {
  return await bcrypt.compare(candiPass, userPass);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
