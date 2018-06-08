var http = require('http');

var fs = require('fs');

var path = require('path');

var mime = require('mime');

var cache = {};

function send404(response) {

    response.writeHead(404, {'Content-Type': 'text/plain'});

    response.write('Error 404: resource not found.');

    response.end();
}


function sendFile(response, filePath, fileContents) {

    response.writeHead(
        200,

       /* !!!!!   for what do we need MIME.lookup - it's made mistake like
        mime.lookup is not a function
 was
 // {"Content-Type": mime.lookup(path.basename(filePath))}

I decided to change for  mime.lookup(path.basename(filePath))
         to 'text/html'

        */
        {"Content-Type": 'text/html'}

    );

    response.end(fileContents);
}


function serveStatic(response, cache, absPath) {

    // checking fact of caching of file in the memory

    if (cache[absPath]) {

        // handling of file from the memory

        sendFile(response, absPath, cache[absPath]);
    } else {
// checking of fact of existing of our file
        fs.exists(absPath, function (exists) {
            if (exists) {
                // read file from disc
                fs.readFile(absPath, function (err, data) {
                        if (err) {
                            send404(response);
                        } else {
                            cache[absPath] = data;
                            // handling of file which was read from disc
                            sendFile(response, absPath, data);
                        }
                    }
                );
            } else {
                // rendering of HTTP response 404

                send404(response);
            }
        });
    }
}


// crate http server with anonim func
// which defines it behavior during of requests



var server = http.createServer(function (request, response) {

        var filePath = false;
        if (request.url == '/') {
            // define default html file
            filePath = 'public/index.html';
        } else {

            //  transform url address into relative path of the file

            filePath = 'public' + request.url;


        }

        var absPath = './' + filePath;

        // handling of static file

    serveStatic(response, cache, absPath);

    }
);


server.listen(3000, function () {
    console.log("Server listening on port 3000");
});


var chatServer = require('./lib/chat_server');

chatServer.listen(server);









