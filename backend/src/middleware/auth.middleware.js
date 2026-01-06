import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { ENV } from "../config/env.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkUser = req.auth();
      const clerkId = clerkUser.userId;
      if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });

      let user = await User.findOne({ clerkId });
      if (!user) {
        // Create user if not exists
        user = await User.create({
          clerkId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: clerkUser.firstName + " " + clerkUser.lastName || "",
          imageUrl: clerkUser.imageUrl || "",
        });
      }

      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized - user not found" });
  }

  console.log("User email:", req.user.email, "Admin email:", ENV.ADMIN_EMAIL);
  if (req.user.email !== ENV.ADMIN_EMAIL) {
    return res.status(403).json({ message: "Forbidden - admin access only" });
  }

  next();
};
