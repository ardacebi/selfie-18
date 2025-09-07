import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const ActivityDataSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCompleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const ActivityData =
  global.models?.ActivityData ||
  models.ActivityData ||
  model("ActivityData", ActivityDataSchema);

export default ActivityData;
