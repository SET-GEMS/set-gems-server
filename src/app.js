require("dotenv").config();
require("./config/db");

const app = require("express")();

const { handleNotFound, handleDefaultError } = require("./errorHandlers");

const port = process.env.PORT || 8000;

app.use(handleNotFound);
app.use(handleDefaultError);

app.set("port", port);

module.exports = app;
