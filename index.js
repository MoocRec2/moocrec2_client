const express = require('express');
const path = require('path');
const engagement = require('./js/algorithm');
const collections = require('./db');
const port = 3000;
const app = express();

app.use(express.json());

app.use('/css', express.static('css'))
app.use('/js', express.static('js'))
app.use('/img', express.static('img'))
app.use('/vendor', express.static('vendor'))
app.use('/', express.static('.'))

// Server html files using root path /.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/session.html'));
})

// Expose backend API using custom paths.
app.post('/engagement/find', (req, res) => {
    var sessionData = req.body;
    var preferredStyle = engagement.deduceEngagement(sessionData);

    // Save the data.
    let users = collections.getCollection('users');
    users.save({ _id: 'aliyanage44', style: preferredStyle }, (err, result) => {
        res.send(err ? err : preferredStyle);
    });
});

// Accepts query parameter "of" which contains username.
// moocrec.com/engagement/styles?of=Tharushi -> Get the preferred style(s) of Tharushi.
app.get('/engagement/styles', (req, res) => {
    let username = req.query.of;

    if (username) {
        let users = collections.getCollection('users');
        users.findOne({ _id: username}, (err, result) => {
            if (err) res.send(err);
            else res.send({ Styles: result.style.PreferedStyles });
        });
    }
    else res.send({ Error: 'Provide username after "of". Example:- /engagement/styles?of=<username>' });
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))