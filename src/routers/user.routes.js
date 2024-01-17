const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const router = new express.Router();

//signup
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//login
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken(); // instance method
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

// get my details
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// update user
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// delete user
router.delete("/users/me", auth, async (req, res) => {
  try {
    const user = await User.deleteOne({ _id: req.user._id });
    res.send(req.user);
  } catch (e) {
    console.error("Error deleting user:", e);
    res.status(500).send();
  }
});

//logout of current session
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//logout of all sessions
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//avatar upload
const upload = multer({
  // dest: "avatars", //remove this to pass file to function
  limits: {
    fileSize: 1000000, //1mb
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(
        new Error("Please upload an image in jpg, jpeg, or png format")
      );
    }
    cb(undefined, true);
  },
});
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer(); //resize image
    req.user.avatar = buffer;
    await req.user.save(); //save to db

    //a binary image can be rendered using data:image/jpg;base64,{binary data}
    res.status(200).send({ message: "file uploaded successfully" });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//delete avatar
router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined; //delete avatar
    await req.user.save(); //save to db
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//get avatar by user id
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id); //get user
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png"); //set header
    res.send(user.avatar); //send avatar
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
