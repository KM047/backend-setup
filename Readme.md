# Setup a Backend as Professional

> This project includes the how a professional developer can setup the backend and the configuration settings for the backend.

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

- step 6: Node mana is used to save files and restart the server during development.

  - Installing the [node man](https://www.npmjs.com/package/nodemon) as dev dependency

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

  - Setting up prettier ignore which ignore the files which don't apply on that file [.prettierignore](.prettierignore) is

    ```json
    {
      "singleQuote": false,
      "bracketSpacing": true,
      "tabWidth": 2,
      "trailingComma": "es5",
      "semi": true
    }
    ```

---

- step 8: To connect the mongoose database

  - install the mongoose, express, dotenv dependency.

    ```shell
    npm i mongoose express dotenv
    ```

    > In this you can connect the database using 2 method

    - Method 1: connect the database using IIFE (eg. (your function)()) in index.js
    - Method 2: Write a function another directory like [DB](./src/db/index.js) and import it into the [index.js](./src/index.js) file

  > In this we use dotenv dependency to import the env files as in the module form but we need to some configuration in this.

  ```javascript
  import dotenv from "dotenv";

  dotenv.config({
    path: "./env", // path to the env file
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

- step 14: Added user and video configuration and added own methods to the schema using mongoose builtin methods -> `pre and methods`.

  > This **pre** is middleware which will run before saving the data in database or it run before the any other methods.

  ```javascript
  userSchema.pre("save", async function (next) {
    // ? This check is necessary because we don't want to rerun this code on every entity change

    if (this.isModified("password")) {
      this.password = bcrypt.hash(this.password, 10);
    }
    next();
  });
  ```

  > This **methods** we can write our own methods for authentication or for any other tasks.
  > for example :- [user.models.js](./src/models/user.models.js)

  - `userSchema.methods.isPasswordCorrect()`
  - `userSchema.methods.generateAccessToken()`
  - `userSchema.methods.generateRefreshToken()`

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
