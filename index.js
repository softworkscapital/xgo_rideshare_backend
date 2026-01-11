const express = require("express");
require("dotenv").config();
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const https = require("https");
const { Pesepay } = require("pesepay");
require('dotenv').config();

const pesepay = new Pesepay(
  process.env.PESEPAY_INTERGRATION_KEY,
  process.env.PESEPAY_ENCRYPTION_KEY
);

const PORT = process.env.APPPORT;

// Route path
const tripRouter = require("./routes/trip");
const userRouter = require("./routes/users");
const paymentRouter = require("./routes/payments");
const driverRouter = require("./routes/driver");
const customerRouter = require("./routes/customer_details");
const counterRouter = require("./routes/counter_offer");
const complaintRouter = require("./routes/complaint");
const CustomerDriverChatRouter = require("./routes/customer_driver_chats");
const CustomerAdminChatRouter = require("./routes/customer_admin_chats");
const sentMessagesRouter = require("./routes/sent_messages");
const topUpRouter = require("./routes/topUp");
const TarrifRouter = require("./routes/tarrifs");
const CounterOfferRouter = require("./routes/counter_offer");
const DriverAnalyticRouter = require("./routes/driver_analytics");
const TripStatusAnalyticRouter = require("./routes/trip_status_analytics");
const ConfigRouter = require("./routes/application_configs");
const StatisticRouter = require("./routes/application_statistics");
const WithdrawalRouter = require("./routes/application_withdrawals");
const VehicleRouter = require("./routes/vehicles");
const StatsHalfHourlyRouter = require("./routes/stats_half_hourly");

const ClientServiceChatRouter = require("./routes/client_service_chat");
const ConversationSupportRouter = require("./routes/conversation_support");
const TarrifDetailsRouter = require("./routes/tarrif_details");
const LastMileRoutingRouter = require("./routes/routing_table_last_mile");
const JobTitlesRouter = require("./routes/job_title");
const TicketProgressRouter = require("./routes/ticket_progress");

const ChatRemsGasCommunityRouter = require("./routes/chat_rems_gas_community");
const rideshareRouter = require("./routes/rideshare");




const pool = require("./cruds/poolfile");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

// Serve uploaded images as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Endpoint to handle image uploads
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const filePath = `/uploads/${req.file.filename}`;
  res.send({ path: filePath });
});

// App Route Usage
app.use("/trip", tripRouter);
app.use("/users", userRouter);
app.use("/payments", paymentRouter);
app.use("/driver", driverRouter);
app.use("/customerdetails", customerRouter);
app.use("/counteroffer", counterRouter);
app.use("/complaint", complaintRouter);
app.use("/customer_driver_chats", CustomerDriverChatRouter);
app.use("/customer_admin_chats", CustomerAdminChatRouter);
app.use("/sentmessages", sentMessagesRouter);
app.use("/topUp", topUpRouter);
app.use("/tarrifs", TarrifRouter);
app.use("/counter_offer", CounterOfferRouter);
app.use("/driver_analytics", DriverAnalyticRouter);
app.use("/trip_status_analytics", TripStatusAnalyticRouter);
app.use("/application_configs", ConfigRouter);
app.use("/application_statistics", StatisticRouter);
app.use("/application_withdrawals", WithdrawalRouter);
app.use("/vehicle", VehicleRouter);
app.use("/stats_half_hourly", StatsHalfHourlyRouter)
app.use("/clientservicechat", ClientServiceChatRouter)
app.use("/tickets", ConversationSupportRouter)
app.use("/tarrifdetails", TarrifDetailsRouter)
app.use("/lastmilerouting", LastMileRoutingRouter)
app.use("/jobtitle", JobTitlesRouter)
app.use("/tickectprogress", TicketProgressRouter)
app.use("/community", ChatRemsGasCommunityRouter);
app.use("/rideshare", rideshareRouter);




pesepay.resultUrl = "https://localhost:3011/payment-result";
pesepay.returnUrl = "XgoLife://home";

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
    paymentReason
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
  res.send("Kwaunoda - Ride Share");
});

app.post("/driver/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (user.password === password) {
    return res.json({
      account_type: user.account_type,
      message: "Login successful",
    });
  } else {
    return res.status(400).json({ message: "Invalid password" });
  }
});



//----------------------------- Creating an interval to post statistics every 24 hours-------------------------

// Function to post application statistics
const postApplicationStatistics = async () => {
  try {
    const response = await axios.post(`https://srv547457.hstgr.cloud:3011/application_statistics`, {
      // Include any necessary data to send with the POST request
    });
    console.log("Statistics posted:", response.data);
  } catch (error) {
    console.error("Error posting statistics:", error.message);
  }
};

// Function to calculate the time until midnight
const getTimeUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // Set to midnight
  return midnight - now; // Return the time in milliseconds
};

// Start the interval at midnight and repeat every 12 hours
const startMidnightInterval = () => {
  const timeUntilMidnight = getTimeUntilMidnight();

  // Set a timeout to start the interval at midnight
  setTimeout(() => {
    postApplicationStatistics(); // Call immediately at midnight
    // Set an interval for every 12 hours (12 * 60 * 60 * 1000 milliseconds)
    setInterval(postApplicationStatistics, 12 * 60 * 60 * 1000);
  }, timeUntilMidnight);
};

// Start the interval
startMidnightInterval();


//--------------------------End of Creating an interval to post statistics every 24 hours-------------------------



//----------------------------- Creating an interval to post statistics every half hour-------------------------
// Function to post half-hourly statistics
const postHalfHourlyStatistics = async () => {
  try {
    const response = await axios.post(`https://srv547457.hstgr.cloud:3011/stats_half_hourly`, {
      // Include any necessary data to send with the POST request
    });
    console.log("Statistics posted:", response.data);
  } catch (error) {
    console.error("Error posting statistics:", error.message);
  }
};

// Function to calculate the time until the next 30-minute interval
const getTimeUntilNextInterval = () => {
  const now = new Date();
  const nextInterval = new Date(now);
  nextInterval.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0); // Round up to the next half hour
  return nextInterval - now; // Return the time in milliseconds
};

// Start the interval for posting every 30 minutes
const startHalfHourlyInterval = () => {
  const timeUntilNextInterval = getTimeUntilNextInterval();

  // Set a timeout to start the interval
  setTimeout(() => {
    postHalfHourlyStatistics(); // Call immediately at the next interval
    // Set an interval for every 30 minutes (30 * 60 * 1000 milliseconds)
    setInterval(postHalfHourlyStatistics, 30 * 60 * 1000);
  }, timeUntilNextInterval);
};

// Start the interval
//startHalfHourlyInterval();


//----------------------------- End of Creating an interval to post statistics every half hour-------------------------



// const options = {
//   cert: fs.readFileSync('/etc/letsencrypt/live/srv547457.hstgr.cloud/fullchain.pem'),
//   key: fs.readFileSync('/etc/letsencrypt/live/srv547457.hstgr.cloud/privkey.pem')
// };

// https.createServer(options, app).listen(process.env.APPPORT || '3011', () => {
//   console.log('app is listening to port' + process.env.APPPORT);
// });




app.listen(PORT, () => {
  console.log("app is listening to port" + " " + PORT);
});