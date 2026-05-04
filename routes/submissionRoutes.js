import express from "express";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import Submission from "../models/Submission.js";
import File from "../models/File.js";

const router = express.Router();

const buildCsv = (rows) => {
  const headers = [
    "Teacher",
    "Email",
    "Department",
    "Criterion",
    "Sub Criterion",
    "Status",
    "Reviewer Comment",
    "Data",
    "Files",
  ];

  const escapeValue = (value) => {
    const normalized =
      typeof value === "string" ? value : JSON.stringify(value ?? "");
    return `"${String(normalized).replace(/"/g, '""')}"`;
  };

  return [
    headers.join(","),
    ...rows.map((row) => row.map(escapeValue).join(",")),
  ].join("\n");
};

router.post("/", auth, async (req, res) => {
  try {
    const { criterion, subCriterion, data } = req.body;

    const submission = await Submission.findOneAndUpdate(
      { userId: req.user.id, subCriterion },
      {
        userId: req.user.id,
        criterion,
        subCriterion,
        data,
        status: "pending",
        reviewerComment: "",
      },
      { new: true, upsert: true }
    );

    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/mine", auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id }).sort({
      criterion: 1,
      subCriterion: 1,
    });
    const submissionIds = submissions.map((submission) => submission._id);
    const files = await File.find({ submissionId: { $in: submissionIds } });

    res.json(
      submissions.map((submission) => ({
        ...submission.toObject(),
        files: files.filter(
          (file) => String(file.submissionId) === String(submission._id)
        ),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/all", auth, allowRoles("hod"), async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("userId", "name email department role")
      .sort({ updatedAt: -1 });
    const submissionIds = submissions.map((submission) => submission._id);
    const files = await File.find({ submissionId: { $in: submissionIds } });

    res.json(
      submissions.map((submission) => ({
        ...submission.toObject(),
        files: files.filter(
          (file) => String(file.submissionId) === String(submission._id)
        ),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/review", auth, allowRoles("hod"), async (req, res) => {
  try {
    const { status, reviewerComment = "" } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status, reviewerComment },
      { new: true, runValidators: true }
    ).populate("userId", "name email department role");

    if (!submission) {
      return res.status(404).json({ msg: "Submission not found" });
    }

    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/export/mine", auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id })
      .populate("userId", "name email department")
      .sort({ criterion: 1, subCriterion: 1 });
    const submissionIds = submissions.map((submission) => submission._id);
    const files = await File.find({ submissionId: { $in: submissionIds } });

    const csv = buildCsv(
      submissions.map((submission) => [
        submission.userId?.name ?? "",
        submission.userId?.email ?? "",
        submission.userId?.department ?? "",
        submission.criterion,
        submission.subCriterion,
        submission.status,
        submission.reviewerComment ?? "",
        submission.data,
        files
          .filter((file) => String(file.submissionId) === String(submission._id))
          .map((file) => file.fileName)
          .join("; "),
      ])
    );

    res.header("Content-Type", "text/csv");
    res.attachment("teacher-report.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/export/all", auth, allowRoles("hod"), async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("userId", "name email department")
      .sort({ criterion: 1, subCriterion: 1 });
    const submissionIds = submissions.map((submission) => submission._id);
    const files = await File.find({ submissionId: { $in: submissionIds } });

    const csv = buildCsv(
      submissions.map((submission) => [
        submission.userId?.name ?? "",
        submission.userId?.email ?? "",
        submission.userId?.department ?? "",
        submission.criterion,
        submission.subCriterion,
        submission.status,
        submission.reviewerComment ?? "",
        submission.data,
        files
          .filter((file) => String(file.submissionId) === String(submission._id))
          .map((file) => file.fileName)
          .join("; "),
      ])
    );

    res.header("Content-Type", "text/csv");
    res.attachment("naac-consolidated-report.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/status", auth, allowRoles("hod"), async (req, res) => {
  try {
    const { status, comments } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status, comments },
      { new: true }
    );

    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/all", auth, allowRoles("hod"), async (req, res) => {
  const submissions = await Submission.find().populate("userId", "name email");
  res.json(submissions);
});

export default router;
