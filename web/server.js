const next = require("next-server");
const http = require("http");

const server = http.createServer(next().getRequestHandler());
server.listen(process.env.PORT || 3000, function() {
  console.log("listening", process.env.PORT || 3000);
});
