const mongoose = require("mongoose");

// const connectionString =
//     "mongodb+srv://pragna:pragna@cluster0.5udgd.mongodb.net/therapeutic-db?retryWrites=true&w=majority";

const connectDB = (url) => {
    return mongoose.connect(url, {
        useNewUrlParser: true,

        //useUnifiedTopology: true,
        // useCreateIndex: true,
        //useNewUrlParser, useUnifiedTopology, useFindAndModify, and useCreateIndex are no longer supported options. Mongoose 6 always behaves as if useNewUrlParser, useUnifiedTopology, and useCreateIndex are true, and useFindAndModify is false. Please remove these options from your code.
    });
};
module.exports = connectDB;