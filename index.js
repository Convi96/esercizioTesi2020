const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')

const { createResponse, generateFullfilmentResponse, detectIntent } = require('./response');
const { ERROR_DIALOGFLOW, ERROR_POST } = require('./constants/constants');
const { initDatabaseConnection } = require('./db/queries');

const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })

initDatabaseConnection();

app.use(express.static(__dirname+'/public'));

app.listen(port, () => {
  console.log(`SQL app listening at http://localhost:${port}`)
})

app.get('/', async (req, res) => {
  res.sendFile('client.html', { root: __dirname });
})

app.post('/api/response', jsonParser, async function (req, res) {
    var response = await createResponse(req.body.queryResult.intent.displayName, req.body.queryResult.parameters)
    var fullfilment = generateFullfilmentResponse(response);
    res.status(200).send(fullfilment);
})

app.post('/api/message', urlencodedParser, async function (req, res) {
    const message = req.body.message;
    if (message) {
      const response = await detectIntent(message);
      if (response == ERROR_DIALOGFLOW) {
        res.status(500).send({'error': ERROR_DIALOGFLOW})
      } else {
        res.status(200).send({'message': response});
      }
    } else {
      res.status(400).send({'error': ERROR_POST})
    }
})