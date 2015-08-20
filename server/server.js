var express = require('express'),
    app = express(),
    path = require('path'),
    config = require('./config'),
    db = new (require('./db'))(config),
    bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, '../app')));
app.listen(process.env.PORT || config.port, function() {
    console.log('on air');
});
app.use(bodyParser.json());

app.post('/adduser', function(req, res) {
    db.addUser(req.body, function (data) {
        res.send(data)
    });
});

app.post('/getuser', function(req, res) {
    db.getUser(req.body, function (data) {
        res.send(data)
    });
});

app.post('/getproject', function(req, res) {
    db.getProject(req.body, function (data) {
        res.send(data)
    });
});

app.post('/updateproject', function(req, res) {
    db.updateProject(req.body, function (data) {
        res.send(data)
    });
});

app.post('/deleteproject', function(req, res) {
    db.deleteProject(req.body, function (data) {
        res.send(data)
    });
});

app.post('/newproject', function(req, res) {
    db.addProject(req.body, function (data) {
        res.send(data)
    });
});

app.post('/gettask', function(req, res) {
    db.getTask(req.body, function (data) {
        res.send(data)
    });
});

app.post('/newtask', function(req, res) {
    db.addTask(req.body, function (data) {
        res.send(data)
    });
});

app.post('/updatetask', function(req, res) {
    db.updateTask(req.body, function (data) {
        res.send(data)
    });
});

app.post('/deletetask', function(req, res) {
    db.deleteTask(req.body, function (data) {
        res.send(data)
    });
});

app.all('*', function(req, res) {
    console.log("all");
    res.redirect("/");
});
