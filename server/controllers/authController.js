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
    const {
      name,
      email,
      password,
    } = req.body;


    // ---------------------------------------------------
    // REQUIRED FIELD VALIDATION
    // ---------------------------------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Name, email and password are required',
      });
    }


    // ---------------------------------------------------
    // NAME VALIDATION
    // ---------------------------------------------------

    if (
      typeof name !== 'string' ||
      name.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Name must contain at least 2 characters',
      });
    }


    if (name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message:
          'Name cannot exceed 50 characters',
      });
    }


    // ---------------------------------------------------
    // EMAIL VALIDATION
    // ---------------------------------------------------

    if (
      typeof email !== 'string' ||
      !isValidEmail(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide a valid email address',
      });
    }


    // Normalize email
    const normalizedEmail =
      email.trim().toLowerCase();


    // ---------------------------------------------------
    // PASSWORD VALIDATION
    // ---------------------------------------------------

    if (
      typeof password !== 'string' ||
      password.length < 6
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Password must contain at least 6 characters',
      });
    }


    if (password.length > 100) {
      return res.status(400).json({
        success: false,
        message:
          'Password cannot exceed 100 characters',
      });
    }


    // ---------------------------------------------------
    // CHECK EXISTING USER
    // ---------------------------------------------------

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          'User already exists with this email',
      });
    }


    // ---------------------------------------------------
    // CREATE USER
    // ---------------------------------------------------

    // Public signup users are always Members
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'Member',
    });


    // ---------------------------------------------------
    // GENERATE TOKEN
    // ---------------------------------------------------

    const token = generateToken(user._id);


    // ---------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------

    res.status(201).json({
      success: true,
      message:
        'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(
      'Signup error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        'Server error during signup',
    });
  }
};


// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;


    // ---------------------------------------------------
    // REQUIRED FIELD VALIDATION
    // ---------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Email and password are required',
      });
    }


    // ---------------------------------------------------
    // EMAIL VALIDATION
    // ---------------------------------------------------

    if (
      typeof email !== 'string' ||
      !isValidEmail(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide a valid email address',
      });
    }


    // Normalize email
    const normalizedEmail =
      email.trim().toLowerCase();


    // ---------------------------------------------------
    // PASSWORD VALIDATION
    // ---------------------------------------------------

    if (
      typeof password !== 'string' ||
      password.length < 6
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid email or password',
      });
    }


    // ---------------------------------------------------
    // FIND USER
    // ---------------------------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });


    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          'Invalid email or password',
      });
    }


    // ---------------------------------------------------
    // CHECK PASSWORD
    // ---------------------------------------------------

    const isPasswordCorrect =
      await user.comparePassword(password);


    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          'Invalid email or password',
      });
    }


    // ---------------------------------------------------
    // GENERATE TOKEN
    // ---------------------------------------------------

    const token =
      generateToken(user._id);


    // ---------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------

    res.status(200).json({
      success: true,
      message:
        'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(
      'Login error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        'Server error during login',
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  signup,
  login,
};