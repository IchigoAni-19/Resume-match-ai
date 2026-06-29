import jwt from "jsonwebtoken";
import tokenBlacklistModel from "../models/blacklist.model.js";

/**
 * @middleware authUser
 * @description Protects routes by verifying the JWT token from either the
 * HTTP-only cookie or the `Authorization: Bearer <token>` header.
 *
 * Validation steps:
 *  1. Extract token from cookie or Authorization header.
 *  2. Reject if token is in the blacklist (already logged out).
 *  3. Verify JWT signature and expiry.
 *  4. Attach decoded payload to `req.user` and call `next()`.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function authUser(req, res, next) {
    let token = req.cookies.token;

    // Also accept Bearer token from Authorization header (e.g. for API clients)
    if (!token && req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Token not provided" });
    }

    // Check blacklist before verifying — avoids wasting time on logged-out tokens
    const isBlacklisted = await tokenBlacklistModel.findOne({ token });
    if (isBlacklisted) {
        return res.status(401).json({ message: "Token is invalid." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, username, iat, exp }
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token." });
    }
}

export default { authUser };
