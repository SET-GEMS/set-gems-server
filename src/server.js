const app = require("express")();
const http = require("http");
const debug = require("debug");

const { handleNotFound, handleDefaultError } = require("./errorHandlers");

const port = process.env.PORT || 8000;

app.use(handleNotFound);
app.use(handleDefaultError);

app.set("port", port);

const httpServer = http.createServer(app);
httpServer.listen(port, handleListen);

function handleListen() {
  const addr = httpServer.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
