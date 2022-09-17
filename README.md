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
* Run "npm install" in the terminal
* Setup ".env" file in the root directory with 6 variables: AUTH0_CLIENT_ID, AUTH0_DOMAIN, AUTH0_CLIENT_SECRET, SESSION_SECRET, AUTH0_CALLBACK_URL, MongoURL
* First 3 values will come from the Auth0 setup
* For SESSION_SECRET, run the command in the terminal "node -e "console.log(crypto.randomBytes(32).toString('hex'))""
* For a AUTH0_CALLBACK_URL = http://localhost:4200/callback
* Last value will be retrieved from the MongoDB Atlas Database
* Lastly, run the command "npm run start:dev"
