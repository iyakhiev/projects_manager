var express = require('express'),
    app = express(),
    path = require('path'),
    config = process.env.PORT ? (require('./config_azure')) : (require('./config')),
    db = new (require('./db'))(config),
    bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, '../app')));
app.listen(process.env.PORT || config.port, function() {
    console.log('on air');
});
app.use(bodyParser.json());

var fs = require('fs'),
    nodemailer = require('nodemailer');

app.post('/sendmail', function(req, res) {
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'isa.yakhiev@gmail.com',
            pass: '03ch01me93go'
        }
    });

    fs.readFile('email_template.html', function (err, logData) {
        if (err) throw err;

        var text = logData.toString();

        var mailOptions = {
            from: 'Isa Yakhiev <isa.yakhiev@gmail.com>', // sender address
            to: 'isa.ya@mail.ru', // list of receivers
            subject: 'Hello' + req.body.mail, // Subject line
            text: 'Hello world', // plaintext body
            html: text // html body
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                res.send('Sending error:' + error);
            } else {
                res.send('Message sent!');
            }
        });
    });
});

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
