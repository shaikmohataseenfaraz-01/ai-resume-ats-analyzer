import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  text: String,
  atsScore: Number,
  suggestions: [String],
});

export default mongoose.model(
  "Resume",
  resumeSchema
);