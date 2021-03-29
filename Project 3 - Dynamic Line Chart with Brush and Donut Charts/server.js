var server_port = 9999;
var application_root = __dirname + "\\htdocs",
    express = require("express"),
    path = require("path");
var cors = require('cors');

var app = express();
app.use(cors());
app.use(express.static(application_root));
app.listen(server_port);
console.log("Web server listening on port " + server_port + ".");