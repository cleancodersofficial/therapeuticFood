const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../middlewares/asyncWrappers");
const notesModel = require("../models/notes_model");
const foodModel = require("../models/food_model");
const CustomAPIError = require("../errors/custom_api_error");
const BadRequestError = require("../errors/bad_request_error");
const NotFoundError = require("../errors/not-found_error");
const createNote = asyncWrapper(async (req, res, next) => {
  const authUser = req.authUser;
  console.log(authUser.name);
  const forProduct = req.body.forProduct;

  const isValidfood = await foodModel.find({ _id: forProduct });

  if (!isValidfood) {
    throw new CustomAPIError("no such food found!");
  }
  // check of already Note avialbale or not with userid and prodID
  const alreadyNoteSubmitted = await notesModel.findOne({
    forProduct: forProduct,

    byUser: req.authUser._id,
  });
  console.log("already..." + alreadyNoteSubmitted);
  console.log("forProduct..." + forProduct);

  console.log("req.authUser._id..." + req.authUser._id);

  if (alreadyNoteSubmitted) {
    return res
      .status(StatusCodes.OK)
      .json({ status: 1, message: "already sumitted....." });
  }
  // req.body.user = authUser._id;
  // req.body.food = authUser._id;
  const Note = await notesModel.create({
    ...req.body,
    byUser: authUser._id,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ status: 1, message: "Note added", Note });
});
const getAllNotes = asyncWrapper(async (req, res, next) => {
  const allNote = await notesModel.find({ byUser: req.authUser._id });
  // .populate({path: "food", select: "name company price category -_id"}) // working OK and removed _id

  // .populate({ path: "food", select: "name company price category _id" }).populate({path: "food"}).populate({path: "user", select: "name email _id"});

  res
    .status(StatusCodes.CREATED)
    .json({ status: 1, message: "Note list", allNote });
});

const getSingleNote = asyncWrapper(async (req, res, next) => {
  const { id: NoteId } = req.params;

  if (!NoteId) {
    throw new BadRequestError("Note id not provided");
  }
  const Note = await notesModel.findById({ _id: NoteId });

  if (!Note) {
    throw new NotFoundError("no such Note available");
  }
  res.status(StatusCodes.OK).json({ status: 1, message: "Note", Note });
});

const updateNote = asyncWrapper(async (req, res, next) => {
  const { id: NoteId } = req.params;
  // const { rating, title, Note } = req.body;

  if (!NoteId) {
    throw new BadRequestError("Note id not provided");
  }
  // const Note = await notesModel.findById({ _id: NoteId });
  // const Note = await notesModel.findByIdAndUpdate(
  const Note = await notesModel.findOneAndUpdate(
    {
      _id: NoteId,
    },
    req.body,
    {
      new: true,
      runValidators: true,
      strict: false,
    }
  );

  if (!Note) {
    throw new NotFoundError("no such Note available");
  }

  // Note.rating = rating;
  // Note.title = title;
  // Note.Note = Note;
  // Note.save();
  res.status(StatusCodes.OK).json({ status: 1, message: "Note updated", Note });
});

const deleteNote = asyncWrapper(async (req, res, next) => {
  const { id: NoteId } = req.params;

  if (!NoteId) {
    throw new BadRequestError("Note id not provided");
  }
  const Note = await notesModel.findById({ _id: NoteId });
  if (!Note) {
    throw new NotFoundError("no such Note available");
  }

  await Note.remove();
  // await notesModel.remove();

  res.status(StatusCodes.OK).json({ status: 1, message: "Note removed!" });
});
const deleteAllNote = asyncWrapper(async (req, res, next) => {
  await notesModel.remove();

  // await notesModel.remove();

  res.status(StatusCodes.OK).json({ status: 1, message: "Note removed!" });
});

module.exports = {
  createNote,
  getAllNotes,
  getSingleNote,
  updateNote,
  deleteNote,
  deleteAllNote,
};
