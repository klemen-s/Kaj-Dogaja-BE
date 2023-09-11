const express = require("express");
const router = express.Router();

const isAuth = require("../authentication/isAuth");
const Place = require("../models/Place");

router.post("/", isAuth, async (req, res) => {
  if (!req.isAuth) {
    return res.json({ errorMsg: "Nimaš privilegijev za to dejanje." });
  }

  try {
    console.log(req.body.place);
    // const place = await Place.findOne({ placeName: req.placeName });

    res.json({ message: "Tu lahko objavljaš nove izlete." });
  } catch (error) {
    return error;
  }
});

router.post("/placeName", isAuth, async (req, res) => {
  try {
    const placeName = await Place.findOne({ placeName: req.body.placeName });

    if (placeName) {
      res.json({
        message: "Ta izlet že obstaja. Ustvari nov izlet.",
        isError: true,
      });
    }

    res.json({
      message: "Ta izlet še ne obstaja, lahko ga ustvariš.",
      isError: false,
    });
  } catch (error) {
    return error;
  }
});

module.exports = router;
