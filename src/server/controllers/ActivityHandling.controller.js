import mongoose from "mongoose";
const { Types } = mongoose;
import ActivityData from "../models/ActivityData.model.js";
import ProfileData from "../models/ProfileData.model.js";

export const createActivity = async (req, res) => {
  const { title, description, startDate, endDate } = req.body;

  if (!title || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "Please provide title, start date and end date for the activity",
    });
  }

  const newActivityData = new ActivityData({
    title,
    description,
    startDate,
    endDate,
  });

  const { userID } = req.params;
  if (!Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  try {
    const savedActivity = await newActivityData.save();
    const updatedProfileData = await ProfileData.findByIdAndUpdate(
      userID,
      { $push: { ownedActivities: savedActivity._id } },
      { new: true },
    );

    if (!updatedProfileData) {
      await ActivityDataData.findByIdAndDelete(savedActivity._id);
      return res.status(404).json({
        success: false,
        message: "User not found, activity not created",
      });
    }

    res.status(200).json({ success: true, data: savedActivity });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getAllUserActivities = async (req, res) => {
  const { userID } = req.params;

  if (!Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  try {
    const profileData = await ProfileData.findById(userID);
    if (!profileData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const profileActivities = profileData.ownedActivities;

    const activities = await ActivityData.find({
      _id: { $in: profileActivities },
    });

    const result = activities.map((activity) => ({
      _id: activity._id,
      title: activity.title,
      description: activity.description,
      startDate: activity.startDate,
      endDate: activity.endDate,
      isCompleted: activity.isCompleted,
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getActivityById = async (req, res) => {
  const { activityID, userID } = req.body;

  if (!Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  if (!Types.ObjectId.isValid(activityID)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Activity ID" });
  }

  try {
    const profile = await ProfileData.findById(userID);
    if (!profile || !profile.ownedActivities.includes(activityID)) {
      return res
        .status(403)
        .json({ success: false, message: "User does not own this activity" });
    }

    const activity = await ActivityData.findById(activityID);
    if (!activity) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: activity._id,
        title: activity.title,
        description: activity.description,
        startDate: activity.startDate,
        endDate: activity.endDate,
        isCompleted: activity.isCompleted,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updateActivity = async (req, res) => {
  const { title, description, startDate, endDate, isCompleted, userID } =
    req.body;

  if (!title || !endDate || !startDate) {
    return res.status(400).json({
      success: false,
      message: "you need the essential parameters to update an activity",
    });
  }

  if (!Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  const { activityID } = req.params;
  if (!Types.ObjectId.isValid(activityID)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Activity ID" });
  }

  try {
    const profile = await ProfileData.findById(userID);
    if (!profile || !profile.ownedActivities.includes(activityID)) {
      return res
        .status(403)
        .json({ success: false, message: "User does not own this activity" });
    }

    const updatedActivity = await ActivityData.findByIdAndUpdate(
      activityID,
      {
        title,
        description,
        startDate,
        endDate,
        isCompleted,
      },
      { new: true },
    );

    if (!updatedActivity)
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });

    res.status(200).json({ success: true, data: updatedActivity });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const deleteActivity = async (req, res) => {
  const { activityID } = req.params;
  const { userID } = req.body;

  if (!Types.ObjectId.isValid(activityID)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Activity ID" });
  }
  if (!Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  try {
    const profile = await ProfileData.findById(userID);
    if (!profile || !profile.ownedActivities.includes(activityID)) {
      return res
        .status(403)
        .json({ success: false, message: "User does not own this activity" });
    }

    const deletedActivity = await ActivityData.findByIdAndDelete(activityID);
    if (!deletedActivity) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }

    await ProfileData.findByIdAndUpdate(
      userID,
      { $pull: { ownedActivities: activityID } },
      { new: true },
    );

    res
      .status(200)
      .json({ success: true, message: "Activity deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
