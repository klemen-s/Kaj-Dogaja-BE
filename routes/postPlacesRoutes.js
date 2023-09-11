const express = require("express");
const router = express.Router();

const Place = require("../models/Place");

router.post("/", async (req, res) => {
  if (!req.isAuth) {
    return res.json({ errorMsg: "Nimaš privilegijev za to dejanje." });
  }

  try {
    const placeName = req.body.place.placeName;
    const coordinates = req.body.place.coordinates;
    const imageUrl = req.body.place.imageUrl;
    const description = req.body.place.description;
    const region = req.body.place.region;
    const tripType = req.body.place.tripType;
    const budget = req.body.place.budget;
    const attractions = req.body.place.attractions;

    if (
      !placeName ||
      !coordinates ||
      !imageUrl ||
      !description ||
      !region ||
      !tripType ||
      !budget ||
      attractions.length < 2
    ) {
      return res.json({ message: "Manjkajo podatki.", isError: true });
    }

    const newPlace = {
      placeName: placeName,
      coordinates: coordinates,
      imageUrl: imageUrl,
      description: description,
      region: region,
      tripType: tripType,
      budget: budget,
      attractions: attractions,
    };

    const place = new Place({ ...newPlace });

    await place.save();

    res.json({
      message: "Izlet je bil uspešno shranjen v podatkovno bazo.",
      isSuccess: true,
    });
  } catch (error) {
    return error;
  }
});

router.post("/placeName", async (req, res) => {
  if (!req.isAuth) {
    return res.json({ errorMsg: "Nimaš privilegijev za to dejanje." });
  }

  try {
    const placeName = req.body.placeName;

    const placeNameExists = await Place.findOne({ placeName: placeName });

    if (placeNameExists) {
      return res.json({
        message: "Ta izlet že obstaja. Ustvari nov izlet.",
        isError: true,
      });
    }

    res.json({
      message: "Izlet še ne obstaja, lahko ga ustvariš.",
      isError: false,
    });
  } catch (error) {
    return error;
  }
});

module.exports = router;
