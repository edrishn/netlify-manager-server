const app = require("./app");

var listener = app.listen(8080, function () {
  console.log("Listening on port " + listener.address().port);
});
