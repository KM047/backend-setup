import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {
  deleteOldFileInCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinaryFileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, newRefreshToken };
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
  // console.log("Email: ", email);
  // console.log("req.body -> ", req.body);

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
  // console.log("userExist -> ", userExist);
  if (userExist) {
    throw new ApiError(409, "User with username or email already exists");
  }

  // console.log("req.files -> ", req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // NOTE: In this when we didn't have coverImage then it throw error like 'Cannot read properties of undefined'

  // ! So we can do it in this method we can also do for avatar

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // console.log("avatarLocalPath ", avatarLocalPath);
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // console.log("avatar -> ", avatar);

  const user = await User.create({
    fullName,
    avatar: {
      publicId: avatar.public_id,
      url: avatar.url,
    },
    coverImage: {
      publicId: coverImage?.public_id || "",
      url: coverImage?.url || "",
    },
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

  const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // NOTE:  In frontend mode cookie can modify but using this it modifies by server only

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken: newRefreshToken,
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
      $unset: {
        refreshToken: 1, // This will remove the field from the document
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
  const incomingRefreshToken = req.user.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    // console.log("incomingRefreshToken ", incomingRefreshToken);
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // console.log(" Decoded token: ", decodedToken);

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

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  console.log("isPasswordValid", isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});
/** */
const getCurrentUser = asyncHandler(async (req, res) => {
  // const user = User.findById(req.user?._id)

  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// NOTE: In this we can use avatar and coverImage but it always better to separate controller and end point for the particular file update
const updatedUserDetails = asyncHandler(async (req, res) => {
  const { fullName, username, email } = req.body;

  if (!(fullName || username || email)) {
    throw new ApiError(400, "All files are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username,
        fullName,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

/**
 *
 *  NOTE: In this we 2 middleware
 * ? 1. Multer -> for file accepting
 * ? 2. verifyJWT(own) -> for check user is logged in or not
 *
 * */

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(401, "Avatar file is missing");
  }

  // console.log("avatarLocalPath ", avatarLocalPath);

  // FIXED: delete old image which is on cloudinary

  const oldAvatar = req.user.avatar;

  // console.log("oldAvatar  ", oldAvatar);
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  console.log(avatar);
  if (!avatar.url) {
    throw new ApiError(500, "Something went wrong while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: { publicId: avatar.public_id, url: avatar.url },
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "Something went wrong or User not found");
  }

  try {
    const isOldImageDelete = await deleteOldFileInCloudinary(
      oldAvatar.publicId
    );
    console.log("isOldImageDelete ", isOldImageDelete);
  } catch (error) {
    console.log("error - ", error);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  const oldCoverImage = req.user.coverImage;

  /**
   * FIXED: check
   * 1) if user have not already cover image and it update what the value of oldCoverImage this.
   * 2) if it give error then handle it properly
   */

  if (!oldCoverImage) {
    throw new ApiError(401, "Cover image not found");
  }

  if (!coverImageLocalPath) {
    throw new ApiError(400, "CoverImage file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(500, "Something went wrong while uploading cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: {
          publicId: coverImage?.public_id || "",
          url: coverImage?.url || "",
        },
      },
    },
    { new: true }
  );

  if (!oldCoverImage.publicId === "") {
    try {
      const isOldImageDelete = await deleteOldFileInCloudinary(
        oldCoverImage.publicId
      );
      console.log("isOldImageDelete ", isOldImageDelete);
    } catch (error) {
      console.log("error - ", error);
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "CoverImage updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "User is missing");
  }

  const channel = await User.aggregate([
    // First pipeline -> check user match or not
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    // Second pipeline -> for user which channel is subscribers
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    // Third pipeline -> for channel which the user subscribed
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    // Fourth pipeline -> for checking count of subscribers and channels
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    // Fifth pipeline -> for projection which gives only selected value
    {
      $project: {
        username: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        subscriberCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exist");
  }
  console.log(" The output data from the pipeline", channel);

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully.")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id), // NOTE: In this the _id gives us an ObjectId as string so want to write like this because this cannot transform into that value
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              // TODO: In this you change the owner field in second stage of the pipeline TRY ONCE
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
  getCurrentUser,
  updatedUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
