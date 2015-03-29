var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');

var redis = require('redis');
var redis_client = redis.createClient();


function handleStaticPage(pathName, res){
   var ext = path.extname(pathName);
   switch (ext) {
      case '.css':
         res.writeHead(200, { 'Content-Type': 'text/css'});
         fs.readFile('.' + pathName, 'utf8', function (err, fd) {
            res.end(fd);
         });
         break;
      case '.js':
         res.writeHead(200, {'Content-Type': 'text/javascript'});
         fs.readFile('.' + pathName, 'utf8', function (err, fd) {
            res.end(fd);
         });
         break;
      case '.png':
         res.writeHead(200, {'Content-Type': 'image/png'});
         fs.readFile('.' + pathName, function(err, fd){
            res.end(fd);
         });
         break;
   }
}


var getRequestHandler = function (req, res) {
   var pathext = path.extname(req.url);
   if(pathext === '.css' || pathext === '.js' || pathext === '.png'){
      handleStaticPage(req.url,res);
   }
   else {
      res.writeHead(200, { 'Content-Type': 'text/html'});
      res.write(fs.readFileSync('client.html'));
      res.end();
   }
};

var postRequestHandler =function (req, res) {
   console.log('Got HTTP POST Request to ' + req.url);
   
   if(req.url === '/push'){ 
      
      var post_request_body = '';
      
      req.on('data', function (data) {
         post_request_body += data;
         console.log("post_request_body += " + post_request_body);
      });

      req.on('end', function (data) {
         redis_client.lpush('all:comments', post_request_body, function(err, repl){
            if (err) {
               res.writeHead(500, { 'Content-Type': 'text/plain' });
               res.write('Internal Server Error');
               res.end();
            } else {
               res.writeHead(200, { 'Content-Type': 'text/html' });
               res.write('OK');
               res.end();
            }
         });
      });
   }
   else if (req.url === '/retrieve') {
      redis_client.lrange('all:comments', 0, -1, function(err, repl){
         if (err) {
            console.log('Error when reading from Redis', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write('Internal Server Error');
            res.end();
         }
         else {
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.write(JSON.stringify(repl));
            res.end();
         }
      });
   }
};

var server = http.createServer(function (req, res) {
   if (req.method === 'GET') {
      getRequestHandler(req, res);
   }
   else if (req.method === 'POST') {
      postRequestHandler(req, res);
   }
});


server.listen(1234, '127.0.0.1');
console.log('Server waiting for connection at http://127.0.0.1:1234/');












