import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  criterion: Number,
  subCriterion: String,
  data: Object,

  status: {
    type: String,
    enum: ["pending", "verified", "revision"],
    default: "pending"
  },
  reviewerComment: {
    type: String,
    default: ""
  }
}, { timestamps: true });

export default mongoose.model("Submission", submissionSchema);
