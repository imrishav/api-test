const express = require('express');
const {
  signup,
  login,
  updateUser,
  deleteUser,
  getAllUsers,
} = require('../controllers/authController');

const router = express.Router();

router.get('/', getAllUsers);
router.post('/signup', signup);
router.post('/login', login);
router.patch('/updateuser', updateUser);
router.delete('/delete/:id', deleteUser);

module.exports = router;
