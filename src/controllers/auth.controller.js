import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * @name registerUserController
 * @description - Register a new user, expects a JSON body with username, password, and email
 * @access - Public
 */
async function registerUserController(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password",
        });
    }
    // This finds a user if EITHER the username or the email matches
    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existingUser) {
        // Check if the email matches the one from the database
        if (existingUser.email === email) {
            return res.status(400).json({
                message: "Account already exists with this email",
            });
        }
        // Otherwise, it must have matched the username
        if (existingUser.username === username) {
            return res.status(400).json({
                message: "Username already taken, try another",
            });
        }
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
        username,
        email,
        password: hashPassword,
    });
    await user.save();

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
    );
    res.cookie("token", token);

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
    });   
}

/**
 * @name loginUserController
 * @description - Login a user, expects a JSON body with username and password
 * @access - Public
 */

async function loginUserController(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
        });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password",
        });
    }
    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
    );
    res.cookie("token", token)
    res.status(200).json({
        message: "User loggedIn successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

export default {
    registerUserController,
    loginUserController
};
