const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const Data = require('./data');

const API_PORT = 3001;
const app = express();
app.use(cors());
const router = express.Router();

// Link para a base de dados (falta encriptar a password)
const dbRoute =
  'mongodb+srv://admin:admin@cluster0-nyswp.mongodb.net/Cluster0?retryWrites=true&w=majority';

// connecta o backend com a base de dados
mongoose.connect(dbRoute, { useNewUrlParser: true });

let db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));

// verificar se a conexão teve sucesso
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

// Metodo getData
// Metodo para retirar todos os dados que estiverem na base de dados
router.get('/questions', (req, res) => {
  Data.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

// http://localhost:3001/questions/?id=5ee613956fe3b0028eac0d0d (ex.)
app.get('/questions', async function (req, res) {
  let id = req.query.id;
  Data.findOne({_id: id }, function(err, document) {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, name: document.name });
  });
});
// http://localhost:3001/questions/5ee613956fe3b0028eac0d0d (ex.)
app.get('/questions/:id', async function (req, res) {
  let id = req.params.id;
  Data.findOne({_id: id }, function(err, document) {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, name: document.name });
  });
});

// Metodo post
// Metodo para guardar um novo registo na base de dados
router.post('/questions', (req, res) => {
  let data = new Data();

  const { id, name, email, observations, date } = req.body;
  // Validações feitas no frontend, ver se faz sentido validar aqui tambem
  if ((!id && id !== 0)) {
    return res.json({
      success: false,
      error: 'INVALID INPUTS',
    });
  }
  data.name = name;
  data.email = email;
  data.observations = observations;
  data.date = date;
  data.id = id;
  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// Adiciona /api para requests http
app.use('/api', router);

// iniciar o backend na porta 3001
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
