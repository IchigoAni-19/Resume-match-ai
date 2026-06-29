import jwt from "jsonwebtoken"
import tokenBlacklistModel from "../models/blacklist.model.js"

async function authUser(req, res, next) {
    // Get token from cookies OR Authorization header
    let token = req.cookies.token
    if (!token && req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1] // Bearer <token>
    }

    if(!token){
        return res.status(401).json({
            message: "Token not provided"
        })
    }
    const isTokenBlacklisted = await tokenBlacklistModel.findOne({token})

    if(isTokenBlacklisted){
        return res.status(401).json({
            message: "Token is invalid."
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded
        next()

    }catch (err) {
        return res.status(401).json({
            message: "Invalid token."
        })
    }
}

export default {authUser}