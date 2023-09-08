require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Place = require("./models/Place");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// pot za dobivanje lokacij glede na določene filtre
app.get("/get-places", async (req, res) => {
  try {
    if (req.query.region === "" && req.query.tripType === "") {
      return res.json({
        message: "Please fill out all of the missing filters.",
        statusCode: 422,
      });
    }

    const params = req.query;

    const places = await Place.find({
      tripType: params.tripType,
      region: params.region,
      budget: params.budget == 0 ? { $in: [1, 2, 3] } : params.budget,
    });

    if (places.length === 0) {
      return res.json({
        message:
          "Ni bilo najdenih izletov s temi zahtevami, prosim izberite druge možnosti.",
        statusCode: 404,
      });
    }

    // glede na parametre najdemo kraje s temi zahtevami
    res.json({ places: places });
  } catch (error) {
    return error;
  }
});

// pot za objavljanje novih lokacij
// dodaj middleware, kjer lahko dodaš novo lokacijo smao če si admin(prijavljen)
// app.post("/post-places", (req, res) => {
//   try {
//     destinacije.forEach(async (placeInfo) => {
//       const place = new Place({
//         placeName: placeInfo.placeName,
//         coordinates: placeInfo.coordinates,
//         imageUrl: placeInfo.imageUrl,
//         description: placeInfo.description,
//         region: placeInfo.region,
//         tripType: placeInfo.tripType,
//         budget: placeInfo.budget,
//         attractions: placeInfo.attractions,
//       });

//       const savedPlace = await place.save();
//       console.log(savedPlace);
//     });

//     res.json({ message: "Items sucessfully saved" });
//   } catch (error) {
//     return error;
//   }
// });

app.use((err, req, res, next) => {
  console.log(err);
});

app.get("/places/:placeId", async (req, res) => {
  try {
    const placeId = req.params.placeId;

    if (!placeId) {
      throw new Error("No place with this identification exists.");
    }

    const place = await Place.findOne({ _id: placeId });

    res.json({ place: place });
  } catch (error) {
    return error;
  }
});

try {
  app.listen(8080);
  mongoose
    .connect(
      `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.xyukcbr.mongodb.net/${process.env.MONGO_STORE}?retryWrites=true&w=majority`
    )
    .then((result) => {})
    .catch((err) => console.log(err));
} catch (error) {
  console.log(error);
}
