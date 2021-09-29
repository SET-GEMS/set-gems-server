require("dotenv").config();
require("./config/db");

const logger = require("morgan");
const express = require("express");
const app = express();

const ranking = require("./routes/ranking");
const { handleNotFound, handleDefaultError } = require("./errorHandlers");

app.use(logger("dev"));
app.use(express.json());

app.use("/ranking", ranking);

app.use(handleNotFound);
app.use(handleDefaultError);

module.exports = app;
