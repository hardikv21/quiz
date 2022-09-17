# Quiz

## Technologies used:
* NodeJs
* ExpressJS
* Bootstrap 5
* Auth0
* FontAwesome
* MongoDB Atlas Database
* Heroku

## Website link:
* http://quiz-math-node.herokuapp.com/

## To install project locally:
* Clone the repo
* Run "npm install" in terminal
* Setup ".env" file in root directory with 6 variable: AUTH0_CLIENT_ID, AUTH0_DOMAIN, AUTH0_CLIENT_SECRET, SESSION_SECRET, AUTH0_CALLBACK_URL, MongoURL
* First 3 values will come from Auth0 setup
* For SESSION_SECRET run command in terminal "node -e "console.log(crypto.randomBytes(32).toString('hex'))""
* For AUTH0_CALLBACK_URL = http://localhost:4200/callback
* Last value will be retrieved from MongoDB Atlas Database
