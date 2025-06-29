import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      maxLength: [
        25,
        "Invalid name. Please enter a name with fewer than 25 characters",
      ],
      minLength: [3, "Name should contain more than 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validator: [validator.isEmail, "Please enter valid email"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [8, "Password should be greater than 8 characters"],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Passwod hashing
userSchema.pre("save", async function (next) {
  this.password = await bcryptjs.hash(this.password, 10);
  // 1st - updating profile(name, email, image) --hashed password will be hashed again ❌
  // 2nd -    Update password ✅
  if (!this.isModified("password")) {
    return next();
  }
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.verifyPassword = async function (userEnteredPassword) {
  return await bcryptjs.compare(userEnteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
