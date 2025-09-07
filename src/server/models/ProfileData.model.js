import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const ProfileDataSchema = new Schema(
  {
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    friendsList: [{ _id: Schema.Types.ObjectId }],
    ownedEvents: {
      type: [Schema.Types.ObjectId],
      ref: "EventData",
      default: [],
    },
    ownedActivities: {
      type: [Schema.Types.ObjectId],
      ref: "ActivityData",
      default: [],
    },
    ownedNotes: {
      type: [Schema.Types.ObjectId],
      ref: "NoteData",
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const ProfileData =
  global.models?.ProfileData ||
  models.ProfileData ||
  model("ProfileData", ProfileDataSchema);

export default ProfileData;
