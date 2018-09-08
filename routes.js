'use strict';
const fs = require("fs");

module.exports = function (app, settings) {
    app.get("/app",
        function(req, res) {
            res.sendFile(settings.appPath + "/index.html");
        });
    app.get("/app/",
        function(req, res) {
            res.sendFile(settings.appPath + "/index.html");
        });
    app.get("/app/*",
        function (req, res) {
            var directory = req.path.split('/');
            directory.splice(1, 1);
            var effectiveDirectory = settings.appPath + directory.join('/');
            const exists = fs.existsSync(effectiveDirectory);
            if (!exists) {
                // res.send("The file at: \"" + req.path + "\" ➞ \"" + directory.join('/') + "\" does not exist.");
                res.sendFile(settings.appPath + "/index.html");
                return;
            }
            res.sendFile(effectiveDirectory);
        });
    app.get("*",
        function (req, res) {
            var path = req.path;
            const HTMLPathPlaceholder = "%path%";
            var pathParts = path.split('/');
            if (!pathParts[pathParts.length - 1].includes('.')) {
                if (!path.endsWith('/'))
                    path += '/';
                path += "index.html";
            }

            // const exists = fsExistsSync(settings.webPath + path);
            const exists = fs.existsSync(settings.webPath + path);
            if (!exists) {
                res.send("The file at: \"" + req.path + "\" ➞ \"" + path + "\" does not exist.");
                return;
                var html = fs.readFileSync(settings.error404path);
                html.replace(HTMLPathPlaceholder, path);
                res.send(html);
                return;
            }
            res.sendFile(settings.webPath + path);
        });
};