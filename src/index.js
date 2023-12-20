// require('dotenv').config()


import dotenv from 'dotenv';

import connectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config({
  path: './env'
})

connectDB()
.then(() => {

  app.on("error", () => {
            console.log("Error: " , error);
            throw error
        })

  app.listen(process.env.PORT || 8000, () => {
    console.log(`⚙ Server listening on ${process.env.PORT}`)
    
  })
  
})
.catch((error) => {
  console.log(` Mongo db connection failed  !!!  ${error}`);
  
})




























// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//     app.on("error", () => {
//         console.log("Error: " , error);
//         throw error
//     })

//     app.listen(process.env.PORT, () => {
//         console.log("listening on port " , process.env.PORT)
        
//     })
//   } catch (error) {
//     console.error("ERROR:-", error);
//   }
// })();
