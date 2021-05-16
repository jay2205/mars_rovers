require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

// Express Constants & setup
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, "../public")));

// API Consts & setup
const API_URI = "https://api.nasa.gov/mars-photos/api/v1/rovers";
const API_KEY = process.env.API_KEY;

// Helper functions
function handleFetchErrors(response) {
  if (!response.ok) {
    throw response;
  }
  return response;
}

async function fetchGet(url) {
  return await fetch(url)
    .then(handleFetchErrors)
    .then((res) => res.json());
}

// API calls

// GETTINNG ROVERS DETAILS.
app.get("/:rover_name", async (req, res) => {
  try {
    const roverCams = await fetchGet(
      `${API_URI}/${req.params.rover_name}?api_key=${API_KEY}`
    );
    res.send({ data: roverCams });
  } catch (err) {
    console.error("error:", err);
  }
});

// GETTING ROVERS PHOTOS BASED ON DATE.
app.get("/:rover_name/photos/:date", async (req, res) => {
  try {
    const { params } = req;
    let roverPhotos = await fetchGet(
      `${API_URI}/${params.rover_name}/photos?earth_date=${params.date}&api_key=${API_KEY}`
    );
    res.send({ data: roverPhotos });
  } catch (err) {
    console.error("error: ", err);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
