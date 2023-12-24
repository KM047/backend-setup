import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinaryFileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
  console.log(req.body);

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
  const userExist = User.findOne({
    $or: [{ username }, { email }],
  });
  console.log(userExist);
  if (userExist) {
    throw new ApiError(409, "User with username or email already exists");
  }

  console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

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

export { registerUser };
