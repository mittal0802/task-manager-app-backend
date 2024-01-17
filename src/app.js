const express = require("express");
const UserRouter = require("./routers/user.routes");
const TaskRouter = require("./routers/task.routes");
require("./db/mongoose");

const app = express();

app.use(express.json());
app.use(UserRouter);
app.use(TaskRouter);

module.exports = app;
