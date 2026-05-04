import express from "express";
import { auth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import File from "../models/File.js";
import Submission from "../models/Submission.js";

const router = express.Router();

router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    const { submissionId } = req.body;
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ msg: "Submission not found" });
    }

    if (String(submission.userId) !== String(req.user.id) && req.user.role !== "hod") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const file = await File.create({
      submissionId,
      uploadedBy: req.user.id,
      criterion: String(submission.criterion),
      subCriterion: submission.subCriterion,
      filePath: req.file.path,
      fileName: req.file.originalname
    });

    res.json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
