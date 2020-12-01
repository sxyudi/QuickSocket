const QsClient = require('./../qs/qsclient');

const client = new QsClient();
client.connect({
    'host' : '127.0.0.1',
    'port' : 3030
});

client.onConnect = function() {
    const buf = Buffer.from('hello quick server');
    client.send(buf);
    client.interval = setInterval(function(){
        const buf = Buffer.from('' + Date.now());
        client.ping(buf);
    }, 1000);
    // client.sendTest1();
    // client.sendTest2();
}

client.onMessage = function(data) {
    data && console.log(data.toString());
};

client.onPing = function(data) {
    console.log("on ping");
    data && console.log(data.toString("utf8"));
};

client.onPong = function(data) {
    console.log("on pong");
    data && console.log(data.toString("utf8"));
};

client.onError = function(err) {

};

client.onClose = function() {
    clearInterval(client.interval);
    client.interval = undefined;
};

client.onEnd = function () {
    clearInterval(client.interval);
    client.interval = undefined;
}
