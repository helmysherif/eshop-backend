const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");
const compression = require("compression");
const dbConnection = require("./config/database");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const PORT = process.env.PORT || 8000;
const app = express();
app.use(cors());
app.use(compression());
dotenv.config({ path: "config.env" });
// db connection
dbConnection();
// middlewares
// limit the size of the request body to 20kb to prevent large payloads from being sent to the server
app.use(
  express.json({
    limit: "20kb",
  })
);
// helmet is a middleware that helps to secure the app by setting various HTTP headers
// to protect against common vulnerabilities such as cross-site scripting (XSS) and clickjacking
app.use(helmet());
// sanitize the request body to prevent NoSQL injection attacks
// Custom sanitize middleware instead of express-mongo-sanitize
app.use((req, _, next) => {
  const sanitize = (obj) => {
    if (!obj) return obj;
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "object") {
        sanitize(obj[key]);
      } else if (key.includes("$")) {
        // Replace prohibited keys
        const cleanKey = key.replace(/[$]/g, "_");
        obj[cleanKey] = obj[key];
        delete obj[key];
      }
    });
  };
  sanitize(req.body);
  sanitize(req.query);
  next();
});
// hpp is a middleware that helps to protect against HTTP Parameter Pollution attacks
// by sanitizing the request query string and removing any duplicate or malicious parameters
app.use(
  hpp({
    whitelist: [
      "price",
      "sold",
      "quantity",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);
// rate limiting middleware to limit the number of requests from a single IP
// to prevent brute force attacks and DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: "Too many requests from this IP, please try again in 15 minutes",
});
app.use("/api", limiter); // apply to all requests
app.use(express.static(path.join(__dirname, "uploads")));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
// mount routes
const mountRoutes = require("./routes");
mountRoutes(app);
// middleware to handle the unknown requests
app.use((req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});
// global error handling middleware for express
app.use(globalError);
// server connection
const server = app.listen(PORT, () => {
  console.log(`app is running at http://localhost:${PORT}`);
});
// handle rejections outside the express
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error("Shutting down...");
    process.exit(1);
  });
});
