const express = require("express");
const {
  createNote,
  getAllNotes,
  getSingleNote,
  updateNote,
  deleteNote,
  deleteAllNote,
} = require("../controllers/note_controller");
const { auth } = require("../middlewares/authentication_middleware.js");
const NoteRoute = express.Router();

NoteRoute.route("/createNote").post(auth, createNote);
NoteRoute.route("/getAllNotes").get(auth, getAllNotes);

NoteRoute.route("/getSingleNote/:id").get(auth, getSingleNote);
NoteRoute.route("/updateNote/:id").patch(auth, updateNote);
NoteRoute.route("/deleteNote/:id").delete(auth, deleteNote);
NoteRoute.route("/deleteAllNote").delete(auth, deleteAllNote);

module.exports = NoteRoute;
