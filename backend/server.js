import dotenv from "dotenv";
import app from "./app.js";
import mongoose from "mongoose";
dotenv.config({ path: "config.env" });

const DB_URI = process.env.MONGODB_URI;

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connnection successful");
  })
  .catch((err) => {
    console.error(err);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
