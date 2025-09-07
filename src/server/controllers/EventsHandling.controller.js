import mongoose from "mongoose";
const { Types } = mongoose;
import EventData from "../models/EventData.model.js";
import ProfileData from "../models/ProfileData.model.js";

export const createEvent = async (req, res) => {
  const {
    title,
    description,
    date,
    eventEnd,
    location,
    type,
    frequencyType,
    frequencyWeekDays,
    repetition,
  } = req.body;

  if (!title || !date || !type) {
    return res.status(400).json({
      success: false,
      message: "Please provide title, date and type for the event",
    });
  }

  const newEventData = new EventData({
    title,
    description,
    date,
    eventEnd: eventEnd || null,
    location,
    type: type || "basic",
    frequencyType: frequencyType || "daily",
    frequencyWeekDays: frequencyWeekDays || [],
    repetition: repetition || null,
  });

  const { userID } = req.params;
  if (!Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  try {
    const savedEvent = await newEventData.save();
    const updatedProfileData = await ProfileData.findByIdAndUpdate(
      userID,
      { $push: { ownedEvents: savedEvent._id } },
      { new: true },
    );

    if (!updatedProfileData) {
      await EventData.findByIdAndDelete(savedEvent._id);
      return res
        .status(404)
        .json({ success: false, message: "User not found, event not created" });
    }

    res.status(200).json({ success: true, data: savedEvent });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getAllUserEvents = async (req, res) => {
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

    const profileEvents = profileData.ownedEvents;

    const events = await EventData.find({ _id: { $in: profileEvents } });

    const result = events.map((event) => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      eventEnd: event.eventEnd,
      location: event.location,
      type: event.type,
      frequencyType: event.frequencyType,
      frequencyWeekDays: event.frequencyWeekDays,
      repetition: event.repetition,
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getEventById = async (req, res) => {
  const { eventID, userID } = req.body;

  if (!Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  if (!Types.ObjectId.isValid(eventID)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Event ID" });
  }

  try {
    const profile = await ProfileData.findById(userID);
    if (!profile || !profile.ownedEvents.includes(eventID)) {
      return res
        .status(403)
        .json({ success: false, message: "User does not own this event" });
    }

    const event = await EventData.findById(eventID);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        eventEnd: event.eventEnd,
        location: event.location,
        type: event.type,
        frequencyType: event.frequencyType,
        frequencyWeekDays: event.frequencyWeekDays,
        repetition: event.repetition,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  const {
    title,
    description,
    date,
    eventEnd,
    location,
    type,
    frequencyType,
    frequencyWeekDays,
    repetition,
    userID,
  } = req.body;

  if (!title || !date || !type) {
    return res.status(400).json({
      success: false,
      message: "you need the essential parameters to update an event",
    });
  }

  if (!Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  const { eventID } = req.params;
  if (!Types.ObjectId.isValid(eventID)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Event ID" });
  }

  try {
    const profile = await ProfileData.findById(userID);
    if (!profile || !profile.ownedEvents.includes(eventID)) {
      return res
        .status(403)
        .json({ success: false, message: "User does not own this event" });
    }

    const updatedEvent = await EventData.findByIdAndUpdate(
      eventID,
      {
        title,
        description,
        date,
        eventEnd,
        location,
        type,
        frequencyType,
        frequencyWeekDays,
        repetition,
      },
      { new: true },
    );

    if (!updatedEvent)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  const { eventID } = req.params;
  const { userID } = req.body;

  if (!Types.ObjectId.isValid(eventID)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Event ID" });
  }
  if (!Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  try {
    const profile = await ProfileData.findById(userID);
    if (!profile || !profile.ownedEvents.includes(eventID)) {
      return res
        .status(403)
        .json({ success: false, message: "User does not own this event" });
    }

    const deletedEvent = await EventData.findByIdAndDelete(eventID);
    if (!deletedEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    await ProfileData.findByIdAndUpdate(
      userID,
      { $pull: { ownedEvents: eventID } },
      { new: true },
    );

    res
      .status(200)
      .json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
