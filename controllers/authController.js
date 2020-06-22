const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Error } = require('mongoose');

//Filter JWT to sign the token
const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//Filter Update Fields Helper Function
const filterObj = (obj, ...allowedFields) => {
  const newObe = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObe[el] = obj[el];
  });
  return newObe;
};

exports.getAllUsers = async (req, res, next) => {
  const allUsers = await User.find();
  res.status(200).json({
    status: 'sucess',
    data: allUsers,
  });
};

//Delete a User
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(204).json({
      status: 'sucess',
      data: null,
    });

    //We Generally don't send any response of delete, thats why no response here.
  } catch (error) {
    res.status(400).json({
      status: 'failure',
      error: 'Something Went Wrong,Please Try Again!',
    });
  }
};

//For User Update
exports.updateUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    //First we will find the user, if exist good otherwise User not Found
    const user = await User.findOne({ email: email }).select('-password');

    if (!user) throw new Error('User Not Found');

    //Secondly we will check what fields user want to update,User won't be able to
    // update fields that are not passed in filterObj

    const filteredBody = filterObj(req.body, 'name', 'mobile', 'address');

    //Then we find the fields and update the user.

    const updatedUser = await User.findByIdAndUpdate(user._id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        updatedUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failure',
      error: 'Something Went Wrong.',
      er: error,
    });
  }
};

//For User SignUP
exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json({
      status: 'success',
      // token,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    res.status(422).json({
      status: 'failure',
      error: error.errors,
    });
  }
};

// for Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //Check if user supplied email & Password
    if (!email || !password) {
      throw new Error('sup');
      return next(new ErrorH('Please Provide email, and password', 400));
    }

    //Finds the User with the parameter user's Email.
    const user = await User.findOne({ email: email }).select('+password');

    //Validate Password using bcrypt, if the hash is same as provided by user

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new Error('sup');

      return;
      return next(new ErrorH('Incorrect email or Password', 401));
    }

    //Assigning jwt token encoded the user id
    const token = signToken(user._id);

    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failure',
      error: 'Something Went Wrong,Please Try Again!',
    });
  }
};
