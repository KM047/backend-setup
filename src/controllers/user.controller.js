import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinaryFileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
<<<<<<< HEAD
=======
import { response } from "express";
>>>>>>> b2f8b1c30470193bcb8071af8e0570a04f1b0df5

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens."
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //? Sample response from server
  // res.status(200).json({
  //     message: "ok Kunal"
  // });

  /**
   * !This are the steps for registering a user
   * ? 1. Get the user details from frontend
   * ? 2. Validate the user details are not empty
   * ? 3. Check the user which is already registered or not: username, email
   * ? 4. Check for user image and avatar
   * ? 5. Upload them to cloudinary: avatar
   * ? 6. Create a user object - create a entry in db
   * ? 7. Remove password and refresh token from the response
   * ? 8. Check for user creation
   * ? 9. return response
   */

  const { fullName, username, email, password } = req.body;
  console.log("Email: ", email);
  console.log("req.body -> ", req.body);

  // Checking if user data is send or not
  //   res.status(200).json({
  //     message: "Registers successfully",
  //     data: {
  //       fullName,
  //       username,
  //       email,
  //       password,
  //     },
  //   });

  // ! Ye hai aam jindagi
  //   if (fullName === "") {
  //     throw new ApiError(400, "fullName is required");
  //   } // and so on ....

  //? Ye hai Mentos jindagi

  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, `${field} is required`);
  }

  // Checking if user is already registered
  const userExist = await User.findOne({
    $or: [{ username }, { email }],
  });
  console.log("userExist -> ", userExist);
  if (userExist) {
    throw new ApiError(409, "User with username or email already exists");
  }

  console.log("req.files -> ", req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path; // In this when we didn't have coverImage then it throw error like 'Cannot read properties of undefined'

  // ! So we can do it in this method we can also do for avatar

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  console.log("avatarLocalPath ", avatarLocalPath);
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  console.log("avatar -> ", avatar);

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, userCreated, "User register successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  /**
   * !This are the steps for registering a user
   * ? 1. get user data from req.body
   * ? 2. get the user credentials -> username and email
   * ? 3. find the user
   * ? 4. password check
   * ? 5. give refresh token and access token
   * ? 6. send it in secure cookies
   */

  const { username, email, password } = req.body;
  //   res.status(200).json({
  //     message: "user login successful",
  //     data: {
  //       username,
  //       email,
  //       password,
  //     },
  //   });

  // if (!(username || email)) {
  //   throw new ApiError(400, " Username or email required");
  // }

  if (!username && !email) {
    throw new ApiError(400, " Username or email required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Passwords do not match");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // NOTE:  In frontend mode cookie can modify the but using this it modifies by server only

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );

  //  console.log(`User: ${username} email: ${email} password: ${password}`);
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken 
};
