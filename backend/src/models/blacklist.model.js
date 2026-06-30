import mongoose from "mongoose";

const blacklistTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: [true, "Token is required to be added to blacklist"],
        },
    },
    { timestamps: true }
);

/**
 * TTL index: automatically removes blacklisted tokens after 24 hours (86400 seconds),
 * matching the JWT expiry. This prevents the collection from growing indefinitely.
 */
blacklistTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema);

export default tokenBlacklistModel;