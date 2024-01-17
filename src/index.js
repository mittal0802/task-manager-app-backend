const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const express = require("express");
const UserRouter = require("./routers/user.routes");
const TaskRouter = require("./routers/task.routes");
require("./db/mongoose");

const app = express();

const port = process.env.PORT;

app.use(express.json());
app.use(UserRouter);
app.use(TaskRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});

// const multer = require("multer");
// const upload = multer({
//   dest: "images",
//   limits: {
//     fileSize: 1000000, //1mb
//   },
//   fileFilter(req, file, cb) {
//     // if (!file.originalname.endsWith(".pdf")) {
//     //   return cb(new Error("Please upload a PDF"));
//     // }

//     //regex101.com
//     if (!file.originalname.match(/\.(doc|docx)$/)) {
//       return cb(new Error("Please upload a Word document"));
//     }
//     cb(undefined, true); //first argument is error, second is boolean
//   },
// });

// app.post(
//   "/upload",
//   upload.single("upload"),
//   (req, res) => {
//     res.send();
//   },
//   (error, req, res, next) => {
//     res.status(400).send({ error: error.message });
//   }
// );

// const jwt = require("jsonwebtoken");

// const myFunct = async () => {
//   const token = jwt.sign(
//     {
//       _id: "abc123",
//     },
//     "thisismynewcourse",
//     {
//       expiresIn: "2 days",
//     }
//   );
//   console.log(token);

//   const data = jwt.verify(token, "thisismynewcourse");
//   console.log(data);
// };

// myFunct();

// const Task = require("./models/task");
// const User = require("./models/user");

// const main = async () => {
//   // const task = await Task.findById("65a655c3cab1323d06d136cc");
//   // await task.populate("owner");
//   // console.log(task.owner);
//   const user = await User.findById("65a655686a1d9dbc020f1d18");
//   await user.populate("tasks");
//   console.log(user.tasks);
// };

// main();
