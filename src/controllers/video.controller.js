import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import {
  deleteOldFileInCloudinary,
  uploadOnCloudinary,
  deleteOldVideoFileInCloudinary,
} from "../utils/cloudinaryFileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  // TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // DONE: get video, upload to cloudinary, create video

  if (
    [title, description].some(
      (field) => field?.trim() === "" || field.trim() === undefined
    )
  ) {
    throw new ApiError(400, `${field} is required`);
  }

  let videoLocalPath;
  let thumbnailLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.videoFile) &&
    req.files.videoFile.length > 0
  ) {
    videoLocalPath = req.files.videoFile[0].path;
  }

  if (
    req.files &&
    Array.isArray(req.files.videoFile) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  console.log("Uploaded video file ", videoFile);

  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const video = await Video.create({
    videoFile: { publicId: videoFile.public_id, url: videoFile.url },
    thumbnail: { publicId: thumbnail.public_id, url: thumbnail.url },
    title,
    description,
    duration: videoFile.duration,
    isPublished: true,
    owner: user,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

/**
 * TODO: Work left
 * - Edit thumbnail and Video description or title
 * - Add like feature
 *
 * @problems
 * - How you edit that particular video data you can use owner detail but owner have more than one video data
 *
 * @solutions
 * - 1) you can use video _id but how an you find its owner is logged in or not you can check its id but you can ...
 * - 2) it necessary to add the middleware as auth.middleware for video to get the data of video
 */
