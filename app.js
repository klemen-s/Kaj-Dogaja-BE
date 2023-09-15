require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const compression = require("compression");

const Place = require("./models/Place");
const User = require("./models/User");
const isAuth = require("./authentication/isAuth");

const postPlacesRoutes = require("./routes/postPlacesRoutes");

const app = express();

app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  );
  next();
});

app.use(helmet());
app.use(compression());

app.use(bodyParser.json());

// pot za dobivanje lokacij glede na določene filtre
app.get("/get-places", async (req, res) => {
  try {
    if (req.query.region === "" && req.query.tripType === "") {
      return res.json({
        message: "Prosim izpolnite vsa polja za izlet.",
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

    res.json({ places: places });
  } catch (error) {
    return error;
  }
});

app.get("/is-auth", isAuth, (req, res) => {
  if (!req.isAuth) {
    return res.json({ errorMsg: "Nimaš privilegijev za to dejanje." });
  }

  res.json({ isAuth: req.isAuth, message: "Imaš privilegije." });
});

app.get("/places/:placeId", async (req, res) => {
  try {
    const placeId = req.params.placeId;

    if (!placeId) {
      throw new Error("Izlet s to oznako ne obstaja.");
    }

    const place = await Place.findOne({ _id: placeId });

    res.json({ place: place });
  } catch (error) {
    return error;
  }
});

app.post("/admin/login", async (req, res) => {
  try {
    const { username } = req.body;
    const { password } = req.body;

    if (!username) {
      return res.json({
        usernameError: "Polje 'uporabniško ime' ni izpoljeno.",
      });
    }

    if (!password) {
      return res.json({ passwordError: "Polja 'geslo' ni izpoljeno." });
    }

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.json({
        usernameError: "Uporabnik s tem imenom ne obstaja.",
      });
    } else {
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        const jwtToken = await jwt.sign(
          { isLoggedIn: true, message: "Admin je prijavljen!" },
          process.env.SECRET_KEY,
          { expiresIn: 60 * 60 }
        );

        res.json({ jwt: jwtToken, message: "JWT poslan." });
      } else {
        res.json({ passwordError: "Nepravilno geslo." });
      }
    }
  } catch (error) {
    return error;
  }
});

app.use("/post-place", isAuth, postPlacesRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode;
  const data = error.data;
  const message = error.message;
  res.status(status).json({ message: message, data: data });
});

try {
  app.listen(process.env.PORT || 8080);
  mongoose
    .connect(
      `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.xyukcbr.mongodb.net/${process.env.MONGO_STORE}?retryWrites=true&w=majority`
    )
    .then((result) => {})
    .catch((err) => console.log(err));
} catch (error) {
  console.log(error);
}
