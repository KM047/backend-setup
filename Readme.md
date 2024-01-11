# Setup a Backend as Professional

> This project includes the how a professional developer can setup the backend and the configuration settings for the backend and frontend.

- [Model link](https://app.eraser.io/workspace/YwFDgH2Q7OXHDPNhtKZ5)

- [Figma link](https://www.figma.com/file/shmxWL5FKRO5GNOPPopBg6/PLAY?type=design&node-id=0-1&mode=design&t=Pe21S9r22VJqDzEw-0)

## Following are the steps

- step 1: first initialize the backend setup using below command

  ```shell
  node init
  ```

---

- step 2: Setting up a Git repository for a professional backend project

---

- step 3: Create the public directory for the project flow and in this directory create temporary folder to upload this folder to git we create a **.gitkeep** file

  ```json
  "type": "module"
  ```

---

- step 4: Create a Git Ignore file to exclude sensitive files from being pushed to git

---

- step 5: Setting up backend project includes managing environment variables and directory structure.

---

- step 6: Node mon is used to save files and restart the server during development.

  - Installing the [node mon](https://www.npmjs.com/package/nodemon) as dev dependency

    ```shell
    npm install -D nodemon
    ```

  - Setting up Node Man for automatic reloading of files and in [package.json](package.json) is

    ```json
    "scripts": {
    "dev": "nodemon scr/index.js"
    },
    ```

---

- step 7: Creating src directory and in this src directory add below files using terminal or you can also create that using the vs code as usual.

  ```shell
  /src:~$ touch app.js constants.js index.js
  /src:~$ mkdir controllers db middlewares models routes utils

  ```

---

- step 8: Install the prettier for formatting the code.

  - Installing the [Prettier](https://www.npmjs.com/package/prettier) as dev dependency

    ```shell
    npm install -D prettier
    ```

  - Setting up prettier for formatting the files configure the prettier file in [.prettierrc](.prettierrc) is

    ```json
    {
      "singleQuote": false,
      "bracketSpacing": true,
      "tabWidth": 2,
      "trailingComma": "es5",
      "semi": true
    }
    ```

  - Setting up prettier ignore which ignore the files which don't apply on that file [.prettierignore](.prettierignore).

---

- step 8: To connect the mongoose database

  - install the mongoose, express, dotenv dependency.

    ```shell
    npm i mongoose express dotenv
    ```

    > In this you can connect the database using 2 method

    - Method 1: connect the database using IIFE (eg. (your function)()) in index.js
    - Method 2: Write a function another directory like [DB](./src/db/index.js) and import it into the [index.js](./src/index.js) file

  > In this we use dotenv dependency to import the env files as in the module form but we need to some configuration in this [index.js](./src/index.js) file.

  ```javascript
  import dotenv from "dotenv";

  dotenv.config({
    path: "./.env", // path to the env file
  });
  ```

- step 9: Created the utilities in the [utils](./src/utils/) and write the API handlers.

  - [asyncHandler.js](./src/utils/asyncHandler.js)
  - [ApiResponse.js](./src/utils/ApiResponse.js)
  - [ApiError.js](./src/utils/ApiError.js)

- step 10: Create the user and video model for the database
- step 11: Install the [mongoose-aggregate-paginate-v2](https://www.npmjs.com/package/mongoose-aggregate-paginate-v2) to allow for write aggregation query

  ```shell
  npm i mongoose-aggregate-paginate-v2
  ```

- step 12: Install the [bcrypt](https://www.npmjs.com/package/bcrypt). A library to help you hash passwords.

  ```shell
    npm i bcrypt
  ```

- step 13: Install the [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) library to generate JSON web tokens for authentication purposes.

  ```shell
  npm i jsonwebtoken
  ```

  > **JSON Web Token (JWT)** is a compact, URL-safe means of representing
  > claims to be transferred between two parties. The claims in a JWT
  > are encoded as a JSON object that is used as the payload of a JSON
  > Web Signature (JWS) structure or as the plaintext of a JSON Web
  > Encryption (JWE) structure, enabling the claims to be digitally
  > signed or integrity protected with a Message Authentication Code
  > (MAC) and/or encrypted.
  > [reference](<[https://](https://datatracker.ietf.org/doc/html/rfc7519)>)

- step 14: Added user and video configuration and added own methods to the schema using mongoose methods -> `pre and methods`.

  > This **pre** is middleware which will run before saving the data in database or it run before the any other methods.

  ```javascript
  userSchema.pre("save", async function (next) {
    // ? This check is necessary because we don't want to rerun this code on every entity change

    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });
  ```

  > This **methods** we can write our own methods for authentication or for any other tasks.
  > for example :- [user.models.js](./src/models/user.models.js)

  - `userSchema.methods.isPasswordCorrect() { ....}`
  - `userSchema.methods.generateAccessToken() { ....}`
  - `userSchema.methods.generateRefreshToken() { ....}`

  > In the above function we use the `jwt.sign()` method to generate a refresh token for the user .

  - [user.models.js](./src/models/user.models.js)

  ```javascript
  // This is code from userSchema.methods.generateAccessToken()
  return jwt.sign(
    {
      // This will generate payload (data which you want to send)
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
  ```

- step 15: Install the cloudinary (from cloudinary website) and [multer](https://www.npmjs.com/package/multer?activeTab=readme) package

  - Configure the utilities for the cloudinary data connection in [cloudinaryFileUpload.js](./src/utils/cloudinaryFileUpload.js)

    - Configure the cloudinary data connection.

    ```javascript
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    ```

    - Write a async function for file upload.

      ```javascript
      const uploadOnCloudinary = async (fileLocalPath) => {
        try {
          if (!fileLocalPath) return null;

          // Upload the file on the cloudinary
          const response = await cloudinary.uploader.upload(fileLocalPath, {
            resource_type: "auto", // This will automatic detect file type
          });

          // file has been uploaded on the cloudinary successfully
          console.log("file uploaded successfully", response.url);

          return response;
        } catch (error) {
          fs.unlinkSync(fileLocalPath); // remove temporary file locally if it exists locally as the upload operation got failed
        }
      };
      ```

  - created middleware for file upload using [multer](./src/middlewares/multer.middleware.js)

    - created middleware for file upload using multer

      ```javascript
      import multer from "multer";
      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, "./public/temp");
        },
        filename: function (req, file, cb) {
          //This code for adding unique file name
          //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() \* 1E9)
          cb(null, file.originalname);
        },
      });

      export const upload = multer({
        storage,
      });
      ```

- step 16: Rotes and controllers

  > In this we write our first controller in the controller folder [user.controller.js](./src/controllers/user.controller.js)

  - In this import [asyncHandler.js](./src/utils/asyncHandler.js) which we created for the error handling
  - An now we create our registerUser to see how we write the routes

    ```javascript
    const registerUser = asyncHandler(async (req, res) => {
      res.status(200).json({
        message: "ok Kunal",
      });
    });
    ```

- step 17: In this we write a route for that controller [user.routes.js](./src/routes/user.routes.js).

  - In this we write routes like this

    ```javascript
    router.route("/register").post(registerUser);
    ```

  - After made this route we want to declare it so, the best way to declare it in app.js where we write code like this and we import it in where we start writing code and not it the starting of file.

    ```javascript
    // Routes imported this is known as a file segregation
    import userRouter from "./routes/user.routes.js";

    // Routes Declaration
    app.use("/api/v1/users", userRouter);
    ```

  > And the URL becomes like this <http://localhost:8000/api/v1/users/register>

- step 18: Now we have to build the user registration controller in this we use the multer for file upload

  - First we register the user we defines the steps below
    1. Get the user details from frontend
    2. Validate the user details are not empty
    3. Check the user which is already registered or not: username, email
    4. Check for user image and avatar
    5. Upload them to cloudinary: avatar
    6. Create a user object - create a entry in db
    7. Remove password and refresh token from the response
    8. Check for user creation
    9. return response

- step 19:

  - **Access tokens**
    > Provide the client with access to the user's data in the application. They contain all the information the server needs to know if the user / device can access the resource you are requesting or not. They are usually expired tokens with a short validity period.
  - **Refresh tokens**
    > A long-lived special kind of token used to obtain a renewed access token. They manage the access token (like generation, revocation, scoping, etc.). A refresh token allows the user to get a new access token without needing to log in again.
  - [03:03](https://youtu.be/7DVpag3cO0g?t=183s) 🕒 Token Lifespan and Types

    - Access tokens are usually short-lived, while refresh tokens have a longer lifespan.
    - Short-lived tokens can last 15 minutes for access tokens, and long-lived tokens can extend up to 30 days or even a year.
    - The choice between short and long-lived tokens depends on security and use-case requirements.

  - [03:43](https://youtu.be/7DVpag3cO0g?t=223s) 🔄 Interaction between Access and Refresh Tokens

    - Access tokens allow authorization for resource access until they expire.
    - Refresh tokens, when validated, grant a new access token without requiring the user to enter credentials.
    - Demonstrates the importance of managing sessions effectively to avoid unnecessary password re-entry.

  - [04:12](https://youtu.be/7DVpag3cO0g?t=252s) 🔐 Security Measures in Token Handling

    - The video emphasizes storing both access and refresh tokens securely in the database.
    - A secure process validates the user through access tokens but requires refresh tokens for more extended sessions.
    - Highlights the token exchange process, ensuring a seamless and secure user experience.

  - [04:40](https://youtu.be/7DVpag3cO0g?t=280s) 🔄 Token Refresh Workflow

    - Illustrates the token refresh workflow where the server validates the refresh token against the database.
    - In case of a match, a new access token is issued to the user, maintaining a continuous user session.
    - Reinforces the concept that token expiration does not necessarily require re-entering the password.

  - [05:05](https://youtu.be/7DVpag3cO0g?t=305s) 🔧 Implementation Steps for Login User

    - Outlines the steps for implementing a basic login user function in the user controller.
    - Focuses on handling requests and responses within the user controller and its associated handler.
    - Exporting the login functionality for integration into the larger application structure.
      1. get user data from req.body
      2. get the user credentials -> username and email
      3. find the user
      4. password check
      5. give refresh token and access token
      6. send it in secure cookies

> Some important notes

- The **$or** operator performs a logical OR operation on an array of one or more <expressions> and selects the documents that satisfy at least one of the <expressions>
- **$set** outputs documents that contain all existing fields from the input documents and newly added fields.

## Access Token and Refresh Token

![alt](https://media.geeksforgeeks.org/wp-content/uploads/20220401174334/Screenshot20220401174003.png)

<!-- <img src="https://media.geeksforgeeks.org/wp-content/uploads/20220401174334/Screenshot20220401174003.png"  width="500" alt="logo" > -->

- **Refresh Token Logic**

  Verifying the refresh token in the backend.
  Matching the received refresh token with the one stored in the database.
  Generating and sending a new access token and refresh token.

- **Token Refresh Mechanism**

  Managing token refresh in the backend.
  Initiating a new request from the frontend to refresh the token.
  Updating the access token and refresh token in the database.

## MongoDB Aggregation Pipeline

- An **aggregation pipeline** consists of one or more stages that process documents:

  - Each stage performs an operation on the input documents. For example, a stage can filter documents, group documents, and calculate values.

  - The documents that are output from a stage are passed to the next stage.

  - An aggregation pipeline can return results for groups of documents. For example, return the total, average, maximum, and minimum values.

- **Aggregation Stages**
  - [$addFields](<[https://](https://www.mongodb.com/docs/current/reference/operator/aggregation/addFields/)>)
  - [$lookup](https://www.mongodb.com/docs/current/reference/operator/aggregation/lookup/)
  - [$match](https://www.mongodb.com/docs/current/reference/operator/aggregation/match/)
  - [$project](https://www.mongodb.com/docs/current/reference/operator/aggregation/project/)
  - [$set](https://www.mongodb.com/docs/current/reference/operator/aggregation/set/)
  - [$cond](https://www.mongodb.com/docs/current/reference/operator/aggregation/cond/)
