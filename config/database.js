const mongoose = require("mongoose");
const dbConnection = () => {
  mongoose.connect(process.env.DB_URI).then((connection) => {
    console.log(`Database is connected at: ${connection.connection.host}`);
  })
}
module.exports = dbConnection;