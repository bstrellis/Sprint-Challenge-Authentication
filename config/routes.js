const axios = require('axios');
const bcryptjs = require('bcryptjs');
const knex = require('knex');
const knexConfig = require('../knexfile');
const key = require('../_secrets/keys');

const { authenticate } = require('./middlewares');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

const db = knex(knexConfig.development);

const generateToken = user => {
  const payload = {
    subject: user.id,
    username: user.username
  };

  const secret = key.jwtKey; // nice work

  const options = {
    expiresIn: '1h'
  };

  return jwt.sign(payload, secret, options);
}

const register = async (req, res) => {
  const userCreds = req.body;
  const hash = bcryptjs.hashSync(userCreds.password, 2); // should be >13 in production
  userCreds.password = hash;
  
  try {
    const insertCount = await db('users').insert(userCreds);
    res.status(200).json(insertCount);
  } catch(err) {
    console.log(err);
    res.status(500).json(err);
  }

}

const login = async (req, res) => {
  const userCreds = req.body;
  try {
    const user = await db('users').where({ username: userCreds.username }).first();
    if (user && bcryptjs.compareSync(userCreds.password, user.password)) {
      const token = generateToken(user);
      res.status(200).json({ message: 'Welcome!', token });
    } else {
      res.status(401).json({ message: 'Username or password incorrect.'})
    }
  } catch(err) {
    res.status(500).json(err);
  }
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
