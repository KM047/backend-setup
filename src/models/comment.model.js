import mongoose, { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    content: {
      type: "string",
      required: true,
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
  },
  { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = model("Comment", commentSchema);
