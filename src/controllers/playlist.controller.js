import mongoose, { Mongoose, isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist

  if (
    [name, description].some(
      (field) => field?.trim() === "" || field.trim() === undefined
    )
  ) {
    throw new ApiError(401, "Name and description are required");
  }

  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: new mongoose.Types.ObjectId(req.user?._id),
  });

  // Just try this for checking something
  const createdPlaylist = await Playlist.findById(playlist._id);

  //   return res
  //     .status(200)
  //     .json(new ApiResponse(200, { playlist }, "playlist created successfully"));

  return res
    .status(200)
    .json(
      new ApiResponse(200, { createdPlaylist }, "playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const playlists = await Playlist.find({
    owner: new mongoose.Types.ObjectId(userId),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { playlists }, "User playlists fetch successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!playlistId) {
    throw new ApiError(400, "PlaylistId is required");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, `Playlist with the id ${playlistId} is not exist`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { playlist }, "playlist get successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "PlaylistId or videoId required");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(
      500,
      `something went wrong while adding video on playlist`
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!playlistId || !videoId) {
    throw new ApiError(400, "PlaylistId or videoId required");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(
      500,
      `something went wrong while adding video on playlist`
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Remove video from playlist updated successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!playlistId) {
    throw new ApiError(400, "PlaylistId required");
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletedPlaylist) {
    throw new ApiError(500, `something went wrong while deleting the playlist`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (
    [playlistId, name, description].some(
      (field) => field?.trim() === "" || field.trim() === undefined
    )
  ) {
    throw new ApiError(400, "Fields are required");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist Updated successfully"));

});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
