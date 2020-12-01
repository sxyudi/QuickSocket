const net = require('net');
const QsClient = require('./qsclient');

class QsServer {
    constructor() {
        this.clients = [];
        this.uid = 0;
    }
}

QsServer.prototype.close = function() {
    this.server.close();
}

QsServer.prototype.listen = function(options, customer) {

    options = options || {};
    options.host = options.host || '127.0.0.1';
    options.port = options.port || 80;

    const that = this;
    this.server = net.createServer(function(socket) { 
        console.log("client comming", socket.remoteAddress, socket.remotePort);
        const client = new QsClient(socket);
        client.uid = this.uid++;
        client.ts = Math.floor(Date.now() / 1000);
        that.clients.push(client);
        that.onConnect(client, customer);
    });

    this.server.on("listening", function() {
        console.log("start listening...", options.host, options.port);
        that.onListening(customer);
    });

    this.server.on("error", function(err) {
        console.log("listen error");
        that.onError(err, customer);
    });

    this.server.on("close", function() {
        console.log("server stop listener");
        that.onClose(customer);
    });

    this.server.listen({
        port: options.port,
        host: options.host,
        exclusive: true,
    });
};

QsServer.prototype.terminate = function(client) {
    for (let i = 0; i < this.clients.length; i++) {
        if (client === clients[i]) {
            this.clients.splice(i, 1);
            client.close();
            break;
        }
    }
}

QsServer.prototype.onConnect = function(client, customer) {
    
}

QsServer.prototype.onListening = function(customer) {

}

QsServer.prototype.onError = function(err, customer) {

}

QsServer.prototype.onClose = function(customer) {

}

module.exports = QsServer;