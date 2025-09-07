import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const NoteDataSchema = new Schema(
  {
    title: { type: String, required: true, default: "New Note" },
    creationDate: { type: Date, required: true, default: Date.now },
    lastModifiedDate: { type: Date, required: true, default: Date.now },
    body: { type: String, required: true, default: "" },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);

const NoteData =
  global.models?.NoteData ||
  models.NoteData ||
  model("NoteData", NoteDataSchema);

export default NoteData;
