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
