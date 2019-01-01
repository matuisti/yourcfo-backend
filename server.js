const fs = require('fs');
const path = require("path");
const parse = require('csv-parse');
const express = require("express");
const fileUpload = require('express-fileupload')
const cors = require('cors')
const app = express();

app.set('views', path.join(__dirname, 'views'))
app.use('/public', express.static(__dirname + '/public'))
app.use(cors())
app.use(fileUpload())

app.post('/upload', (req, res, next) => {
  let uploadFile = req.files.file
  const fileName = req.files.file.name
  uploadFile.mv(
    `${__dirname}/public/files/${fileName}`,
    function(err) {
      if (err) {
        return res.status(500).send(err)
      }

      res.json({
        file: req.files.file.name,
      })
    },
  )
});

app.get("/api/op", (req, res, next) => {
  var inputFile = 'public/files/' + req.query.file;
  var parser = parse({
    delimiter: ';'
  }, function(err, data) {
    var response = [];
    data.forEach(function(line, key) {
      var euros = parseFloat(line[2]);
      var type = parseInt(line[3]);
      var message = line[8].replace('Viesti: ', '');

      var country = {
        "Kirjauspäivä": line[0],
        "Arvopäivä": line[1],
        "Määrä EUROA": euros,
        "Laji": type,
        "Selitys": line[4],
        "Saaja/Maksaja": line[5],
        "Saajan tilinumero ja pankin BIC": line[6],
        "Viite": line[7],
        "Viesti": message,
        "Arkistointitunnus": line[9]
      };

      response.push(country);
      if (data.length - 1 === key) {
        res.json(response);
      }
    });
  });
  console.log(inputFile);
  var stream = fs.createReadStream(inputFile);
  stream.pipe(parser);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
