const express = require('express');
const path = require('path');
const engagement = require('./js/algorithm');
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

    res.send(preferredStyle);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))