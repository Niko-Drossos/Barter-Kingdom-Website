const express = require('express')
const session = require('express-session');
const app = express()
const fs = require('fs')
const multer = require('multer');
const mongoose = require('mongoose')
const mongodb = require('mongodb')
const upload = multer({ dest: 'public/uploads/' })

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

const mongoURL = 'mongodb+srv://ndross427:9205DRIVE777@cluster0.ipo5a6z.mongodb.net/Barter_Kindgom'

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

  static async logIn(user) {
    try{
      const person = await Person.findOne(user)
      let output = person ? `Logged in` : `Failed to log in user` 
      console.log(output)
      return true
    }
    catch (err) {
      console.error(err)
      return false
    }
  }

  static async validateLogin(loginAttempt) {
    try {
      const user = await Person.findOne(loginAttempt);
      let works = user || false
      return works
    } catch (error) {
      console.error('Error validating login:', error);
    }
  }
}

/* -------------------------- GET requests for app -------------------------- */

// List of routes
const validURL = ['/', 'about', 'bku', 'contact', 'sign-in', 'sign-up', 'profile']

// Separate one for root 

app.get('/', async (req, res) => {
  // let user = localStorage.getItem('LoggedInUser')
  if ( req.session.isLoggedIn ) {
    res.render('Main');

  } else {
    res.render('sign-in')
  }
});

app.get('/:page', (req, res) => {
  let page = req.params.page
  validURL.includes(page) ? res.render(page) : res.redirect('/')
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
  let input = {
    login: req.body.login,
    password: req.body.password
  }

  const user = await Login.validateLogin(input);

  if (user) {
    // Set the user's _id in the session
    req.session.userId = user._id;
    await Login.logIn(input);
    console.log(user._id)
    res.redirect('/')
  }
  res.redirect('/')
})

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

