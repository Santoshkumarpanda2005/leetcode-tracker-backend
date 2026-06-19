const User = require('../models/userModel');

// @route   GET /api/user/profile
// @desc    Get current user profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select('-password');
    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ detail: "Server error" });
  }
};

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, gender, dateOfBirth, bio, githubUrl, linkedinUrl } = req.body;

    // Find user by ID from JWT token
    const user = await User.findById(req.user.sub);

    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (bio !== undefined) user.bio = bio;
    if (githubUrl !== undefined) user.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;

    const updatedUser = await user.save();
    
    // Return user without password
    const userObj = updatedUser.toObject();
    delete userObj.password;

    res.json(userObj);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ detail: "Server error updating profile" });
  }
};
