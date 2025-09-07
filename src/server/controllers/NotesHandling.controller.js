import mongoose from "mongoose";
const { Types } = mongoose;
import NoteData from "../models/NoteData.model.js";
import ProfileData from "../models/ProfileData.model.js";

export const createNote = async (req, res) => {
  const { title, creationDate, lastModifiedDate, body, tags } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Please provide a title for the note",
    });
  }

  const newNoteData = new NoteData({
    title,
    creationDate,
    lastModifiedDate,
    body: body || " ",
    tags: tags || [],
  });

  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  try {
    const savedNote = await newNoteData.save();
    const updatedProfileData = await ProfileData.findByIdAndUpdate(
      id,
      { $push: { ownedNotes: savedNote._id } },
      { new: true },
    );

    if (!updatedProfileData) {
      await NoteData.findByIdAndDelete(savedNote._id);
      return res
        .status(404)
        .json({ success: false, message: "User not found, note not created" });
    }

    res.status(200).json({ success: true, data: savedNote });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getAllUserNotes = async (req, res) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  try {
    const profile = await ProfileData.findById(id);

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const profileNotes = profile.ownedNotes;

    const notes = await NoteData.find({ _id: { $in: profileNotes } });
    const result = notes.map((n) => ({
      _id: n._id,
      title: n.title,
      creationDate: n.creationDate,
      lastModifiedDate: n.lastModifiedDate,
      body: n.body,
      tags: n.tags || [],
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getNoteById = async (req, res) => {
  const { noteID, userID } = req.body;

  if (!Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  if (!Types.ObjectId.isValid(noteID)) {
    return res.status(404).json({ success: false, message: "Invalid Note ID" });
  }

  try {
    const profile = await ProfileData.findById(userID);
    if (!profile || !profile.ownedNotes.includes(noteID)) {
      return res
        .status(403)
        .json({ success: false, message: "User does not own this note" });
    }

    const note = await NoteData.findById(noteID);
    if (!note) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: note._id,
        title: note.title,
        creationDate: note.creationDate,
        lastModifiedDate: note.lastModifiedDate,
        body: note.body,
        tags: note.tags || [],
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updateNote = async (req, res) => {
  const { title, creationDate, lastModifiedDate, body, tags, userID } =
    req.body;

  if (!title && !body && !creationDate && !lastModifiedDate && !tags) {
    return res.status(400).json({
      success: false,
      message: "you need at least one field to update",
    });
  }

  if (!Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  const { noteID } = req.params;
  if (!Types.ObjectId.isValid(noteID)) {
    return res.status(404).json({ success: false, message: "Invalid Note ID" });
  }

  try {
    const profile = await ProfileData.findById(userID);
    if (!profile || !profile.ownedNotes.includes(noteID)) {
      return res
        .status(403)
        .json({ success: false, message: "User does not own this note" });
    }

    const updatedNote = await NoteData.findByIdAndUpdate(
      noteID,
      {
        title,
        creationDate,
        lastModifiedDate,
        body,
        tags,
      },
      { new: true },
    );

    if (!updatedNote)
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });

    res.status(200).json({ success: true, data: updatedNote });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const deleteNote = async (req, res) => {
  const { noteID } = req.params;
  const { userID } = req.body;

  if (!Types.ObjectId.isValid(noteID)) {
    return res.status(404).json({ success: false, message: "Invalid Note ID" });
  }
  if (!Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  try {
    const profile = await ProfileData.findById(userID);
    if (!profile || !profile.ownedNotes.includes(noteID)) {
      return res
        .status(403)
        .json({ success: false, message: "User does not own this note" });
    }

    const deletedNote = await NoteData.findByIdAndDelete(noteID);
    if (!deletedNote) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }

    await ProfileData.findByIdAndUpdate(
      userID,
      { $pull: { ownedNotes: noteID } },
      { new: true },
    );

    res
      .status(200)
      .json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const duplicateNote = async (req, res) => {
  const { noteID, userID, creationDate } = req.body;

  if (!Types.ObjectId.isValid(noteID)) {
    return res.status(404).json({ success: false, message: "Invalid Note ID" });
  }

  if (!Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  try {
    const profile = await ProfileData.findById(userID);
    if (!profile || !profile.ownedNotes.includes(noteID)) {
      return res
        .status(403)
        .json({ success: false, message: "User does not own this note" });
    }

    const duplicatingNote = await NoteData.findById(noteID);
    if (!duplicatingNote) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }

    const newNoteData = new NoteData({
      title: duplicatingNote.title,
      creationDate: creationDate ? creationDate : new Date(),
      lastModifiedDate: creationDate ? creationDate : new Date(),
      body: duplicatingNote.body,
      tags: duplicatingNote.tags || [],
    });

    const savedNote = await newNoteData.save();

    const updatedProfileData = await ProfileData.findByIdAndUpdate(
      userID,
      { $push: { ownedNotes: savedNote._id } },
      { new: true },
    );

    if (!updatedProfileData) {
      await NoteData.findByIdAndDelete(savedNote._id);
      return res
        .status(404)
        .json({ success: false, message: "User not found, note not created" });
    }

    res.status(200).json({ success: true, data: savedNote });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
