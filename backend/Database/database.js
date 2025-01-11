require("dotenv").config()
const mongoose = require("mongoose");
const mongoOnline = 'mongodb+srv://huynq1808:Huynq1808@@clusterdb1.spz4ncq.mongodb.net/?retryWrites=true&w=majority&appName=Clusterdb1'
mongoose
  .connect(
    `mongodb://${process.env.DB_user}:${process.env.DB_password}@localhost:27017/${process.env.DB_name}?authSource=admin`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected")) //If connected to DB
  .catch((err) => {
      console.log('Error connecting to DB', `mongodb://${process.env.DB_user}:${process.env.DB_password}@localhost:27017/${process.env.DB_name}`)

      console.log(err)
  }); //If not connected to DB
