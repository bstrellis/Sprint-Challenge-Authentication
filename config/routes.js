const axios = require('axios');
const bcryptjs = require('bcryptjs');
const knex = require('knex');
const knexConfig = require('../knexfile');

const { authenticate } = require('./middlewares');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

const db = knex(knexConfig.development);

// create token

const register = async (req, res) => {
  const userCreds = req.body;
  const hash = bcryptjs.hashSync(userCreds.password, 2); // should be >13 in production
  userCreds.password = hash;
  
  try {
    const returned = await db('users').insert(userCreds);
    res.status(200).json(returned);
  } catch(err) {
    console.log(err);
    res.status(500).json(err);
  }

}

function login(req, res) {
  // implement user login
}

function getJokes(req, res) {
  axios
    .get(
      'https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_ten'
    )
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
