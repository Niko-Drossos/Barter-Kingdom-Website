const express = require('express')
const session = require('express-session');
const app = express()
// const fs = require('fs')
const multer = require('multer');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
/* const mongodb = require('mongodb')
const upload = multer({ dest: 'public/uploads/' }) */
require('dotenv').config()

const port = 3000

/* --------------------------------- Imports -------------------------------- */
const Person = require('./models/userModel');
const Subscription = require('./models/subscriptionModel');
const Contact = require('./models/contactModel');
/* -------------------------------------------------------------------------- */

// Set the views for Express
app.set('view engine', 'ejs')
app.set('./views', 'views')

app.use(express.static('public'))

// Parse the body text as JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

const mongoURL = process.env.URL

mongoose.connect(mongoURL)
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch( err => {
    console.error(err)
  })

/* ------------------------------- Login class ------------------------------ */
class Login {
  constructor(req, res) {
    this.loginData = {
      login: req.body.login,
      password: req.body.password,
      email: req.body.email,
    };
    this.req = req; // Store the request object
    this.res = res; // Store the response object
  }

  async saveUser() {
    try {
      const newUser = new Person(this.loginData);
      await newUser.save();
      console.log(`User saved successfully.: \n${newUser}`);
    } catch (error) {
      console.error(`Error saving user: \n${error}`);
    }
  }

  // Modified login method with context
  async logIn() {
    try {
      let { login, password } = this.loginData
      const user = await Person.findOne({login, password});
      if (!user) {
        return false;
      }

      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(
        this.loginData.password,
        user.password
      );

      if (passwordMatch) {
        // Set the user's _id in the session
        this.req.session.userId = user._id;
        console.log('User logged in successfully');
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      this.res.status(500).send('Login failed.');
    }
  }

  static async findUser(search) {
    try {
      let { login, password } = search
      const users = await Person.findOne({ login: login, password: password })
      // If users is true user was found
      return users
    } catch (error) {
      console.error(error);
      /* ------------------------------ return false ------------------------------ */
    }
  }

}

/* -------------------------- GET requests for app -------------------------- */

// List of routes
const validURL = ['/', 'about', 'bku', 'contact', 'sign-in', 'sign-up', 'profile']

// Separate one for root 

app.get('/', async (req, res) => {
  // let user = localStorage.getItem('LoggedInUser')

  res.render('Main');
});

app.get('/:page', (req, res) => {
  let page = req.params.page
  validURL.includes(page) ? res.render(page) : res.render('lostPage')
})

app.get('/*', (req, res) => {
  res.send('How did you get here?')
})

/* -------------------------- POST requests for app ------------------------- */

app.post('/UserSignup', (req, res) => {
  let user = new Login(req, res)
  // window.localStorage.setItem('LoggedInUser', JSON.stringify(user))
  user.saveUser()
  res.redirect('/')
})

//! WORKING ON THIS
app.post('/UserLogin', async (req, res) => {
  let loginInfo = {
    login: req.body.login,
    password: req.body.password
  }
  let userLogin = await Login.findUser(loginInfo);

  const loginSuccess = await userLogin.logIn();

  if (userLogin) {
    console.log(`User: ${userLogin} signed in `)
    res.redirect('/');
  } else {
    res.redirect('/sign-in'); // Redirect to login page or display an error
  }
});

app.post('/Subscribe', async (req, res) => {
  try {
    const input = {
      email: req.body.email,
      name: req.body.firstName
    };

    const subscription = new Subscription(input);

    await subscription.save();
    console.log('Subscription saved successfully.');
    res.redirect('/');
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/ContactSubmit', async (req, res) => {
  try {
    const input = {
      email: req.body.email,
      name: req.body.firstName
    };

    const contact = new Contact(input);

    await contact.save();
    console.log('Contact submission saved successfully.');
    res.redirect('/');
  } catch (error) {
    console.error('Error saving contact submission:', error);
    res.status(500).send('Internal Server Error');
  }
});

/* --------------------------- Delete user by _ID --------------------------- */

app.post('/DeleteUser/:id', async (req, res) => {
  try {
    // Assuming you have a 'Person' model for user data
    const deletedUser = await Person.findByIdAndRemove(req.params.id);

    if (!deletedUser) {
      console.log('Person not found.');
    } else {
      console.log('Person deleted successfully.');
    }

    res.redirect('/');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Internal Server Error');
  }
});


/* --------------------------- Turn on the server --------------------------- */

app.listen(port, () => {
  console.log(`App listening on port: http://localhost:${port}`)
})

