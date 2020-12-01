const QsServer = require('./../qs/qsserver');

const customer = null;
const server = new QsServer();
server.listen({
    'host' : '127.0.0.1',
    'port' : 3030
}, customer);

server.onConnect = function(client, customer) {
   
    client.onMessage = function(data) {
        data && console.log(data.toString());
    };

    client.onPing = function(data) {
        console.log("on ping");
        data && console.log(data.toString("utf8"));
        client.pong();
    };

    client.onPong = function(data) {
        console.log("on pong");
        data && console.log(data.toString("utf8"));
    };

    client.onError = function(err) {

    };

    client.onClose = function() {

    };

    const buf = Buffer.from('welcome to my quick server');
    client.send(buf);
}
