import { handleRefreshTokenService, logInUserService, logOutAllDevicesService, logOutUserService, signUpUsersService } from "../services/userService.js";
import asyncHandler from "../utils/asyncHandler.js";

const signUpUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const newUser = await signUpUsersService(username, email, password);
  return res.status(201).json({
    message: "User Signed Up Successfully! Proceed to Login",
    Users: newUser,
  });

});

const logInUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken } = await logInUserService(email, password);
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
  const newAccessToken = await handleRefreshTokenService(refreshToken);
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 15,
    secure: true,
  });

  return res.status(200).json({ accessToken: newAccessToken });

});

const logOutUser = asyncHandler(async (req, res) => {
  let oldRefreshToken;

  if (req.cookies?.refreshToken) {
    oldRefreshToken = req.cookies.refreshToken;
  } else if (req.body?.refreshToken) {
    oldRefreshToken = req.body.refreshToken;
  }
  if (oldRefreshToken) {
    await logOutUserService(oldRefreshToken);
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
  const userId = req.userId;
  await logOutAllDevicesService(userId);
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

export { signUpUser, logInUser, handleRefreshToken, logOutUser, logOutAllDevices };