import mongoose from "mongoose";

/**
 * @typedef {Object} IUser
 * @property {string} username - Unique display name chosen at registration.
 * @property {string} email    - Unique email address used for login.
 * @property {string} password - Bcrypt-hashed password (never stored in plain text).
 */

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [true, "Username is required"],
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
});

const User = mongoose.model("users", userSchema);

export default User;
