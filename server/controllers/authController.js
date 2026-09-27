const User = require('../models/User');

const jwt = require('jsonwebtoken');

// =====================================================
// GENERATE JWT TOKEN
// =====================================================

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

// =====================================================
// EMAIL VALIDATION
// =====================================================

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// =====================================================
// SIGNUP
// =====================================================

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    if (
      typeof name !== 'string' ||
      name.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name must contain at least 2 characters',
      });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot exceed 50 characters',
      });
    }

    if (
      typeof email !== 'string' ||
      !isValidEmail(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      typeof password !== 'string' ||
      password.length < 6
    ) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters',
      });
    }

    if (password.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Password cannot exceed 100 characters',
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'Member',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Signup error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error during signup',
    });
  }
};

// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    if (
      typeof email !== 'string' ||
      !isValidEmail(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      typeof password !== 'string' ||
      password.length < 6
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordCorrect =
      await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// =====================================================
// UPDATE PROFILE
// =====================================================

const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      currentPassword,
      newPassword,
      profilePicture,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // ---------------------------------------------------
    // NAME
    // ---------------------------------------------------

    if (name !== undefined) {
      if (
        typeof name !== 'string' ||
        name.trim().length < 2
      ) {
        return res.status(400).json({
          success: false,
          message: 'Name must contain at least 2 characters',
        });
      }

      if (name.trim().length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot exceed 50 characters',
        });
      }

      user.name = name.trim();
    }

    // ---------------------------------------------------
    // EMAIL
    // ---------------------------------------------------

    if (email !== undefined) {
      if (
        typeof email !== 'string' ||
        !isValidEmail(email.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address',
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'This email is already in use',
        });
      }

      user.email = normalizedEmail;
    }

    // ---------------------------------------------------
    // PASSWORD
    // ---------------------------------------------------

    if (newPassword !== undefined && newPassword !== '') {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message:
            'Current password is required to change password',
        });
      }

      const passwordCorrect =
        await user.comparePassword(currentPassword);

      if (!passwordCorrect) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      if (
        typeof newPassword !== 'string' ||
        newPassword.length < 6
      ) {
        return res.status(400).json({
          success: false,
          message:
            'New password must contain at least 6 characters',
        });
      }

      if (newPassword.length > 100) {
        return res.status(400).json({
          success: false,
          message:
            'New password cannot exceed 100 characters',
        });
      }

      user.password = newPassword;
    }

    // ---------------------------------------------------
    // PROFILE PICTURE
    // ---------------------------------------------------

    if (profilePicture !== undefined) {
      if (typeof profilePicture !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid profile picture',
        });
      }

      if (profilePicture.length > 2 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Profile picture is too large',
        });
      }

      user.profilePicture = profilePicture.trim();
    }

    // ---------------------------------------------------
    // SAVE USER
    // ---------------------------------------------------

    await user.save();

    // ---------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error(
      'Update profile error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  signup,
  login,
  updateProfile,
};