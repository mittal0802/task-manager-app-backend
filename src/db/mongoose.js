const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((error) => {
    console.log("Error!", error);
  });
