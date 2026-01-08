const express = require("express");
require("dotenv").config();
const cors = require("cors");
const https = require("https");
const { Pesepay } = require("pesepay");
require('dotenv').config();

const pesepay = new Pesepay(
  process.env.PESEPAY_INTERGRATION_KEY,
  process.env.PESEPAY_ENCRYPTION_KEY
);

const PORT = process.env.PESEWEBPORT;

const bodyParser = require("body-parser");

const app = express();
app.use(express.json());

const corsOptions = {
  origin: "*", // Adjust this to your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));


pesepay.resultUrl = "https://localhost:3012/payment-result";
pesepay.returnUrl = "http://localhost:3000/payment-success";

app.post("/initiate-payment", async (req, res) => {
  const {
    currencyCode,
    paymentMethodCode,
    customerEmail,
    customerPhone,
    customerName,
    amount,
    paymentReason,
  } = req.body;

  const transaction = pesepay.createTransaction(
    amount,
    currencyCode,
    paymentReason,
  );

  try {
    pesepay.initiateTransaction(transaction).then((response) => {
      if (response.success) {
        const redirectUrl = response.redirectUrl; 
        const referenceNumber = response.referenceNumber;
        return res.json({ success: true, redirectUrl, referenceNumber });
      } else {
        return res.status(400).json({
          success: false,
          message: response.message || "Payment initiation failed",
        });
      }
    });
  } catch (error) {
    console.log("Error initiating payment:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/check_payment/:referenceNumber", async (req, res) => {
  const referenceNumber = req.params.referenceNumber;
  try {
    pesepay.checkPayment(referenceNumber).then(response => {
      if (response.success) {
        if (response.paid) {
          return res.json({ success: true, response });
        }
      } else {
        const message = response.message;
        return res.json({ success: false, message });
      }
    });
  } catch (error) {
    console.log("error", error);
  }
});

app.get("/", (req, res) => {
  res.send("Kwaunoda");
});


// const options = {
//   cert: fs.readFileSync('/etc/letsencrypt/live/srv547457.hstgr.cloud/fullchain.pem'),
//   key: fs.readFileSync('/etc/letsencrypt/live/srv547457.hstgr.cloud/privkey.pem')
// };

// https.createServer(options, app).listen(process.env.APPPORT || '3012', () => {
//   console.log('app is listening to port' + process.env.APPPORT);
// });




app.listen(PORT, () => {
  console.log("app is listening to port" + " " + PORT);
});