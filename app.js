const express = require('express'),
app           = express(),
bodyParser    = require('body-parser'),
MongoClient   = require('mongodb').MongoClient,
mongoURL      = 'mongodb+srv://hardik:hardik21@atlascluster.p8emwjg.mongodb.net/?retryWrites=true&w=majority',
PORT          = process.env.PORT || 4200;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

const filterQuestions = (questions, filterType) => {
    return questions.filter((question) => question.type === filterType);
};

const calculateScore = (response) => {
    let quizScore = 0; 
    for (const property in response) {
        if (eval(property) == response[property]) {
            quizScore += 10;
        }
    }
    return quizScore;
}

MongoClient.connect(mongoURL)
    .then((response) => {
        const quizDB = response.db('quiz');
        
        app.get('/sum-quiz', (req, res) => {
            quizDB.collection('question').find().toArray()
                .then((response) =>
                    res.render(
                        'quiz',
                        {
                            questions: filterQuestions(response, 'sum'),
                            quizType: 'sum'
                        }
                    )
                )
                .catch((error) => console.log(error));
        });

        app.post(
            '/sum-quiz',
            (req, res) => (
                res.render(
                    'result',
                    {
                        quizType: 'Sum',
                        quizScore: calculateScore(req.body)
                    }
                )
            )
        );

        app.get('/minus-quiz', (req, res) => {
            quizDB.collection('question').find().toArray()
                .then((response) =>
                    res.render(
                        'quiz',
                        {
                            questions: filterQuestions(response, 'minus'),
                            quizType: 'minus'
                        }
                    )
                )
                .catch((error) => console.log(error));
        });
    })
    .catch((error) => console.log(error));

    app.post(
        '/minus-quiz',
        (req, res) => {
            console.log(req.body);
            res.render(
                'result',
                {
                    quizType: 'Minus',
                    quizScore: calculateScore(req.body)
                }
            )
        }
    );

app.get('/', (req, res) => res.render('index'));

app.listen(PORT, () => console.log(`Listening on ${PORT}:`));