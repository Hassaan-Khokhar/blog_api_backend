import Users from "../models/userModel.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import asyncHandler from "../utils/asyncHandler.js";

const signUpUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (await Users.findOne({ email })) {
    return res.status(400).json({
      message: "Email already registered",
    });
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = await Users.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      message: "User Signed Up Successfully! Proceed to Login",
      Users: newUser,
    });
  }
});

const logInUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await Users.findOne({ email });
  if (!user || user === null) {
    return res.status(400).json({
      error: "Account Not Found!",
    });
  }
  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) {
    return res.status(400).json({
      error: "Incorrect Password!",
    });
  } else {
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "30d",
      },
    );

    if (user.refreshToken.length >= 5) {
      user.refreshToken.shift();
    }

    user.refreshToken.push(refreshToken);
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 15,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return res.status(200).json({
      message: "Log In Successful!",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  let refreshToken;

  if (req.cookies?.refreshToken) {
    refreshToken = req.cookies.refreshToken;
  } else if (req.body?.refreshToken) {
    refreshToken = req.body.refreshToken;
  }

  if (!refreshToken)
    return res.status(401).json({ error: "No Refresh Token Provided" });

  const user = await Users.findOne({ refreshToken });

  if (!user) {
    return res
      .status(403)
      .json({ error: "Refresh Token is Invalid or Revoked" });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || user._id.toString() !== decoded.userId) {
      return res.status(403).json({ error: "Refresh Token Expired" });
    }

    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 15,
      secure: true,
    });

    return res.status(200).json({ accessToken: newAccessToken });
  });
});

const logOutUser = asyncHandler(async (req, res) => {
  let oldRefreshToken;

  if (req.cookies?.refreshToken) {
    oldRefreshToken = req.cookies.refreshToken;
  } else if (req.body?.refreshToken) {
    oldRefreshToken = req.body.refreshToken;
  }
  if (oldRefreshToken) {
    const user = await Users.findOne({ refreshToken: oldRefreshToken });
    if (user) {
      user.refreshToken = user.refreshToken.filter(
        (token) => token !== oldRefreshToken,
      );
      await user.save();
    }
  }
  res.cookie("accessToken", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });
  res.cookie("refreshToken", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });
  res.status(200).json({ message: "User Logged Out Successfully" });
});

const logOutAllDevices = asyncHandler(async (req, res) => {
  const user = await Users.findById(req.userId);

  if (!user) {
    return res.status(400).json({ error: "user not found!" });
  }

  user.refreshToken = [];
  await user.save();

  res.cookie("accessToken", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });
  res.cookie("refreshToken", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });
  res.status(200).json({ message: "Successfully Logged Out of All Devices!" });
});

export { signUpUser, logInUser, handleRefreshToken, logOutUser, logOutAllDevices};