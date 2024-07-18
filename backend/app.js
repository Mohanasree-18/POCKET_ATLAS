require("dotenv").config();
const express = require("express");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

/*The `express-rate-limit` middleware in Express.js prevents server overload 
by limiting the number of requests a client can make in a given time, 
protecting against DDoS attacks and excessive usage.*/

const PORT = process.env.PORT || 5000;
const app = express();

//API URL
const API_URL = "";
const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

//!CORS CONFUGURATION
const corsOptions = {
  origin: ["http://localhost:5173"],
};

//!configuration to rate-limit
const apiLimiter = rateLimit({
  windowMS: 15 * 60 * 1000, //15 min
  max: 100,
});

//!MIDDLEWARES
app.use(express.json()); //used to parse incoming json data
app.use(apiLimiter); //rate limiter middleware
app.use(cors(corsOptions));

//!CURRENCY CONVERSION
app.post("/api/convert", async (req, res) => {
  try {
    //get the user data
    const { from, to, amount } = req.body;
    console.log({ from, to, amount });
    //construct the API URL
    const url = `${API_URL}/${API_KEY}/pair/${from}/${to}/${amount}`;
    const response = await axios.get(url);
    if (response.data && response.data.result === "success") {
      res.json({
        base: from,
        target: to,
        conversionRate: response.data.conversion_rate,
        convertedamount: response.data.conversion_result,
      });
    } else {
      res.json({
        message: "Error converting currency",
        details: response.data,
      });
    }
  } catch (error) {
    res.json({ message: "Error converting currency", details: error.message });
  }
});

//!START THE SERVER
app.listen(PORT, console.log(`server is runnning on PORT ${PORT}`));
