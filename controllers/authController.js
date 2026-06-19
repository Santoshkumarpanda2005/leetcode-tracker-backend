const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ sub: id }, process.env.SECRET_KEY || 'mysecretkey123', { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { email, password, leetcodeUsername } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ detail: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Ghost account claim logic
    const ghostUser = await User.findOne({ leetcodeUsername });
    
    if (ghostUser) {
      if (ghostUser.email) {
        return res.status(400).json({ detail: "LeetCode username already registered to an email." });
      } else {
        ghostUser.email = email;
        ghostUser.password = hashedPassword;
        await ghostUser.save();
        return res.json({ access_token: generateToken(ghostUser._id), token_type: "bearer" });
      }
    }

    const user = new User({ email, password: hashedPassword, leetcodeUsername });
    await user.save();

    res.json({ access_token: generateToken(user._id), token_type: "bearer" });
  } catch (error) {
    res.status(500).json({ detail: "Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ detail: "Incorrect email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ detail: "Incorrect email or password" });
    }

    res.json({ access_token: generateToken(user._id), token_type: "bearer" });
  } catch (error) {
    res.status(500).json({ detail: "Server Error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, leetcodeUsername, newPassword } = req.body;

    const user = await User.findOne({ email, leetcodeUsername });
    if (!user) {
      return res.status(404).json({ detail: "User not found with matching Email and LeetCode Username" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ detail: "Server Error" });
  }
};
