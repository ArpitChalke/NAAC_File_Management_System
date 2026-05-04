import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Submission",
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  criterion: String,
  subCriterion: String,
  filePath: String,
  fileName: String
}, { timestamps: true });

export default mongoose.model("File", fileSchema);
