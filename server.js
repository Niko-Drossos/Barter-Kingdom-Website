const express = require('express')
const app = express()
const fs = require('fs')
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' })

const port = 3000
const jsonPath = "./data/JSON/messages.json"
const userInfoPath = "./data/JSON/userInfo.json"
const emailListPath = "./data/JSON/emailList.json"


// Set the views for Express
app.set('view engine', 'ejs')
app.set('./views', 'views')

app.use(express.static('public'))

// Parse the body text as JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------------- Utility JSON methods -------------------------- */

class JsonTools {
  constructor(req, res) {
    /* this.formData = {
      fName: req.body.fName,
      lName: req.body.lName,
      Email: req.body.email,
      Photo: req.file
    } */
  }

  static deleteUser(userName) {
    try {
      let jsonData = JsonTools.readJson(userInfoPath)
      jsonData.users = jsonData.users.filter(user => user.login !== userName)
      JsonTools.writeJson(userInfoPath, jsonData)
      console.log(`User '${userName}' deleted successfully.`);

    } catch (error) {
      console.log(`Error in deleting user: ${userName}`)
    }
  }

  static writeJson(path, parsedJsonData) {
    try {
      const updatedJson = JSON.stringify(parsedJsonData, null, 2);
      fs.writeFileSync(path, updatedJson, 'utf8', (err) => {
        if (err) throw err;
      })
    } catch (error) {
      console.log(`Error writing "${parsedJsonData}" to json file`)
    }
  }
    
  static readJson(path) {
    try {
      const jsonReturn = fs.readFileSync(path, 'utf8');
      if (!jsonReturn) {
        console.error('JSON file is empty.');
        return null; // Return an empty object or handle it as per your application logic.
      }
      return JSON.parse(jsonReturn);
    } catch (err) {
      console.error('Error reading or parsing JSON file:', err);
      return {}; // Return an empty object or handle the error as needed.
    }
  }
}

/* ------------------------------- Login class ------------------------------ */

class Login {
  constructor(req, res) {
    this.loginData = {
      login: req.body.login,
      password: req.body.password,
      email: req.body.email
    }
  }

  saveUser() {
    let parsedData = JsonTools.readJson(userInfoPath)
    try {
      parsedData.users.push(this.loginData);
      JsonTools.writeJson(userInfoPath, parsedData)
    } catch (error) {
      console.error('Error saving data: ', error);
    }
  }

  static validateLogin(loginAttempt) {
    let parsedData = JsonTools.readJson(userInfoPath);
    let checkUser = parsedData.users.find(user => {
      return loginAttempt.login === user.login && loginAttempt.password === user.password;
    });
    checkUser ? console.log(`CheckUser: ${checkUser}`) : console.log('Login failed. Invalid credentials.')
  }
}

/* -------------------------- Get requests for app -------------------------- */

// List of routes
const validURL = ['/', 'about', 'bku', 'contact', 'TEST', 'sign-in', 'sign-up']

// Separate one for root 
app.get('/', async (req, res) => {
  res.render('Main');
  
});

app.get('/:page', (req, res) => {
  let page = req.params.page
  validURL.includes(page) ? res.render(page) : res.redirect('/')
})


app.get('/*', (req, res) => {
  res.send('How did you get here?')
})

/* -------------------------- Post requests for app ------------------------- */

app.post('/UserSignup', (req, res) => {
  let user = new Login(req, res)
  user.saveUser()
  res.redirect('/')
})

app.post('/UserLogin', (req, res) => {
  let input = {
    login: req.body.login,
    password: req.body.password
  }
  Login.validateLogin(input)
  res.redirect('/')
})

app.post('/Subscribe', (req, res) => {
  let input = {
    email: req.body.email,
    name: req.body.firstName
  }
  let emails = JsonTools.readJson(emailListPath)
  emails.push(input)
  JsonTools.writeJson(emailListPath, emails)
  res.redirect('/')
})

app.post('/ContactSubmit', (req, res) => {
  let input = {
    email: req.body.email,
    name: req.body.firstName
  }
  let emails = JsonTools.readJson(emailListPath)
  emails.push(input)
  JsonTools.writeJson(emailListPath, emails)
  res.redirect('/')
})

app.post('/DeleteUser', (req, res) => {
  JsonTools.deleteUser(req.body.userDelete)
  res.redirect('/')
})

/* --------------------------- Turn on the server --------------------------- */

app.listen(port, () => {
  console.log(`App listening on port: http://localhost:${port}`)
})

