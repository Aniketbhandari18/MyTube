import dotenv from "dotenv"
import connectDB from "./db/index.js";

import { app } from "./app.js";

dotenv.config()

connectDB()
  .then(() =>{
    app.on("error", (error) =>{
      console.log("Error running server", error);
    })
    app.listen(process.env.PORT || 8000, () =>{
      console.log(`Server listening at http://localhost:${process.env.PORT}`)
    });
  })
  .catch((error) =>{
    console.log("MongoDB connection Failed", error);
  })
