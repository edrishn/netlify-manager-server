var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  //Test
  res.write("Hello World!"); //write a response to the client
  res.end(); //end the response
});

module.exports = router;
