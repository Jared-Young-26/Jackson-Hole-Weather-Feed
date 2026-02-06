const express = require("express");
const { XMLParser } = require("fast-xml-parser");

const app = express();
const PORT = 3000;

const XML_URL = "https://www.jacksonhole.com/api/snow.xml";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "text",
  trimValues: true
});

let cachedData = null;
let lastUpdated = null;

async function updateSnowReport() {
  try {
    const res = await fetch(XML_URL); // ✅ built-in fetch
    const xml = await res.text();
    cachedData = parser.parse(xml).snowreport;
    lastUpdated = new Date().toISOString();
    console.log("Snow report updated:", lastUpdated);
  } catch (err) {
    console.error("Failed to fetch XML:", err.message);
  }
}

setInterval(updateSnowReport, 60_000);
updateSnowReport();

app.use(express.static("public"));

app.get("/data", (req, res) => {
  if (!cachedData) {
    return res.status(503).json({ error: "Data unavailable" });
  }

  res.json({
    summitBase: cachedData.snow_depth_summit ?? "—",
    seasonTotal: cachedData.season_total_summit ?? "—",
    lifts: cachedData.lifts ?? "—",
    trails: cachedData.trails ?? "—",
    summitTemp: cachedData.summit_current ?? "—",
    todayWeather: cachedData.weather_today?.text ?? "—",
    lastUpdated
  });
});

app.listen(PORT, () => {
  console.log(`Mountain sign running at http://localhost:${PORT}`);
});
