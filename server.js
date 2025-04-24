const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
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
app.use(express.json());
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
