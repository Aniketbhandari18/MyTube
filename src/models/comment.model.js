import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    comment: {
      type: String,
      required: true,
      trim: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video"
    }
  },
  {
    timestamps: true
  }
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = model("Comment", commentSchema);