const body_parser = require('body-parser');
const child_process = require('child_process');
const express = require('express');
const http = require('http');
const fs = require('fs');
const mysql = require('mysql');
const path = require('path');
const process = require('process');
const socketio = require('socket.io');

const app = express();
const defaultSettings = {
    'appPath': __dirname + '/angular/dist/angular',
    'webPath': __dirname + '/www',
    "error404Path": __dirname + "/www/404.html",
    "port": 3000,
    "sql_user": "2811ict-chatapp",
    "sql_pass": "tmA4duTOvvPsbljA",
    "sql_db": "2811ict-chatapp",
    "sql_addr": "localhost",
    "sql_port": 3306,
    "sql_prefix": "chat_"
};
const server = http.Server(app);

let httpServer;
let mysqlConnection;
let settings;

app.use(body_parser.json());
app.use(body_parser.urlencoded({
    extended : true
}));

function StartSockets (io) {
    console.log("Socket Service started...");
    io.attach(server);
}

function StartMySQL (settings) {
    mysqlConnection = mysql.createConnection({
        host: settings.sql_addr,
        user: settings.sql_user,
        password: settings.sql_pass,
        database: settings.sql_db
    });
    mysqlConnection.connect(function (err) {
        if (err) {
            console.log("Error: Could not connect to the MySQL database. Please check your settings.");
            console.log(err);
            return;
        }

        console.log("MySQL Server connected at: " + settings.sql_addr + ":" + settings.sql_port);
    });
}

function StartHTTP(settings) {
    httpServer = server.listen(settings.port, function() {
        var address = httpServer.address().address;
        var port = httpServer.address().port;
        if (address == "::") {
            address = "localhost/127.0.0.1";
        }
        console.log("Server listening on: " + address + ":" + port);
    });
}

function StartServer (settings) {
    StartMySQL(settings);
    StartHTTP(settings);
    var io = socketio(server);
    StartSockets(io, settings);
    require('./sockets.js')(io, mysqlConnection);
    require('./routes.js')(app, settings);
    require('./api.js')(app, settings, mysqlConnection)
}

function main() {
    settings = defaultSettings;
    StartServer(settings);
}

main();