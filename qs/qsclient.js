const net = require('net');
const qspkg = require('./qspkg');

class QsClient {
    constructor (socket) {
        this.socket = socket;
        this.listenConnect();
    }
}

QsClient.MAX_DATA_LEN = 65535;

QsClient.prototype.connect = function(options) {
    const client = this;
    options = options || {};
    options.host = options.host || '127.0.0.1';
    options.port = options.port || 80;
    this.socket = net.connect(options.port, options.host, function(){
        console.log('connected to server!', options.host, options.port);
    });
    this.socket.on("connect", function() {
        console.log("connect success");
        client.listenConnect();
        client.onConnect();
    });
}

QsClient.prototype.listenConnect = function () {
    if (!this.socket) {
        return;
    }

    const client = this;
    this.socket.on("close", function(){
        client.onClose();
    });
    this.socket.on("data", function(data){
        client.onData(data);
    });
    this.socket.on("error", function(err){
        client.onError(err);
    });
    this.socket.on("end", function(){
        client.onEnd();
    });
}

QsClient.prototype.isConnected = function() {
    if (!this.socket) {
        return false;
    }
    if (this.socket.destroyed) {
        return false;
    }
    if (this.socket.readyState !== 'open') {
        return false;
    }
    return true;
}

QsClient.prototype.sendData = function(type, data) {
    const socket = this.socket;
    if (socket) {
        const buf = qspkg.package_data(type, data);
        socket.write(buf);
    } else {
        this.onError();
    }
}

//黏包测试
QsClient.prototype.sendTest = function() {
    const socket = this.socket;
    if (socket) {
        const type = qspkg.TYPE_MSG;
        const data1 = Buffer.from('hello quick server');
        const data2 = Buffer.from('I am Ronnie');
        const buf1 = qspkg.package_data(type, data1);
        const buf2 = qspkg.package_data(type, data2);
        socket.write(Buffer.concat([buf1, buf2], buf1.length + buf2.length));
    } else {
        this.onError();
    }
}

//插入无效数据测试
QsClient.prototype.sendTest2 = function() {
    const socket = this.socket;
    if (socket) {
        const type = qspkg.TYPE_MSG;
        const data1 = Buffer.from('hello quick server');
        const data2 = Buffer.from('I am Ronnie');
        const buf1 = qspkg.package_data(type, data1);
        const buf2 = qspkg.package_data(type, data2);
        socket.write(Buffer.concat([data1, buf1, data2, buf2], data1.length + buf1.length + data2.length + buf2.length));
    } else {
        this.onError();
    }
}

QsClient.prototype.onData = function(data) {

    // 上一次剩余没有处理完的半包;
    if (this.last_pkg) {
        this.last_pkg = Buffer.concat([this.last_pkg, data], this.last_pkg.length + data.length);
    } else {
        this.last_pkg = data;	
    }

    let offset = 0;
    let pkg_head = qspkg.read_pkg_head(this.last_pkg, offset);
    if (!pkg_head.type) {
        if (pkg_head.offset >= this.last_pkg.length) {
            this.last_pkg = null;
        } else if (pkg_head.offset > offset) {
            const buf = Buffer.allocUnsafe(this.last_pkg.length - pkg_head.offset);
            this.last_pkg.copy(buf, 0, pkg_head.offset, this.last_pkg.length);
            this.last_pkg = buf;
        }
        return;
    }

    while(pkg_head.offset + pkg_head.len <= this.last_pkg.length) { // 判断是否有完整的包;
        if (pkg_head.len > 0) {
            // 根据长度信息来读取我们的数据,架设我们穿过来的是文本数据
            const pkg_data = Buffer.allocUnsafe(pkg_head.len);
            this.last_pkg.copy(pkg_data, 0, pkg_head.offset, pkg_head.offset + pkg_head.len);
            this.dispathData(pkg_head.type, pkg_data);
        } else {
            this.dispathData(pkg_head.type);
        }
        offset = pkg_head.offset + pkg_head.len;
        if (offset >= this.last_pkg.length) { // 正好我们的包处理完了;
            break;
        }
        pkg_head = qspkg.read_pkg_head(this.last_pkg, offset);
        if (!pkg_head.type) {
            offset = pkg_head.offset;
            break;
        }
    }
    if (offset >= this.last_pkg.length) {
        this.last_pkg = null;
    } else if (offset > 0) {
        const buf = Buffer.allocUnsafe(this.last_pkg.length - offset);
        this.last_pkg.copy(buf, 0, offset, this.last_pkg.length);
        this.last_pkg = buf;
    }
}

QsClient.prototype.dispathData = function(type, data) {
    if (type === qspkg.TYPE_MSG) {
        this.onMessage(data);
    } else if (type === qspkg.TYPE_PING) {
        this.onPing(data);
    } else if (type === qspkg.TYPE_PONG) {
        this.onPong(data);
    }
}

QsClient.prototype.onConnect = function() {

}

QsClient.prototype.onClose = function() {
    console.log("on close");
}

QsClient.prototype.onError = function(err) {
    console.log("on error", err);
    console.log(err);
}

QsClient.prototype.onPing = function(data) {
    console.log("on ping", data);
    data && console.log(data.toString("utf8"));
    this.sendData(qspkg.TYPE_PONG);
}

QsClient.prototype.onPong = function(data) {
    console.log("on pong", data);
    data && console.log(data.toString("utf8"));
}

QsClient.prototype.onMessage = function(data) {
    console.log("on message", data);
}

QsClient.prototype.onEnd = function() {
    console.log("on end");
}

QsClient.prototype.ping = function(data) {
    this.sendData(qspkg.TYPE_PING, data);
}

QsClient.prototype.pong = function(data) {
    this.sendData(qspkg.TYPE_PONG, data);
}

QsClient.prototype.send = function(data) {
    this.sendData(qspkg.TYPE_MSG, data);
}

QsClient.prototype.close = function() {
    if (this.socket) {
        this.socket.destroyed();
        this.socket = null;
        //this.onClose();
    }
}

module.exports = QsClient;