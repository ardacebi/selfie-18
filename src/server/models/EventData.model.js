import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const EventDataSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    eventEnd: { type: Date, default: null },
    location: String,
    type: { type: String, required: true, default: "basic" },
    frequencyType: { type: String, default: "daily" },
    frequencyWeekDays: { type: [Number], default: [] },
    repetition: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  },
);

const EventData =
  global.models?.EventData ||
  models.EventData ||
  model("EventData", EventDataSchema);

export default EventData;
