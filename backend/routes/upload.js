const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { auth } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/image", auth, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      imageUrl,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

router.post("/images", auth, upload.array("images", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No image files provided" });
    }

    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    res.json({
      success: true,
      imageUrls,
      message: "Images uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload images" });
  }
});

router.post(
  "/profile-photo",
  auth,
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No profile photo provided" });
      }

      const profilePhotoUrl = `/uploads/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: profilePhotoUrl },
        { new: true }
      );

      const Product = require("../models/Product");
      await Product.updateMany(
        { seller: req.user._id },
        { $set: { "seller.avatar": profilePhotoUrl } }
      );

      res.json({
        success: true,
        profilePhotoUrl,
        user: user,
        message: "Profile photo updated successfully",
      });
    } catch (error) {
      console.error("Profile photo upload error:", error);
      res.status(500).json({ error: "Failed to upload profile photo" });
    }
  }
);

router.delete("/profile-photo", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.avatar && user.avatar !== "/images/user-avatar.png") {
      const oldPhotoPath = path.join(
        uploadsDir,
        user.avatar.replace("/uploads/", "")
      );
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    user.avatar = "/images/user-avatar.png";
    await user.save();

    res.json({
      success: true,
      message: "Profile photo removed successfully",
      user: user,
    });
  } catch (error) {
    console.error("Profile photo delete error:", error);
    res.status(500).json({ error: "Failed to remove profile photo" });
  }
});

router.use("/uploads", express.static(uploadsDir));

module.exports = router;
