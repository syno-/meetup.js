var connect = require('connect');
var port = 8080;
connect.createServer(
    connect.static(__dirname + '/main')
).listen(port);

console.log('Start Server: http://localhost:' + port);

