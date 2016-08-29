var Protocol = require('pomelo-protocol');
var net = require('net');
var Package = Protocol.Package;
var Message = Protocol.Message;

var params = {host: "121.40.53.201", port: "3010"};
var handshakeBuffer = {
	'sys': {type: 'socket', version: '0.0.1'},
	'user': {}
};

var socket = new net.Socket();
socket.binaryType = 'arraybuffer';

socket.connect(params.port, params.host, function () {
	console.log('开始连接');
	var obj = Package.encode(Package.TYPE_HANDSHAKE, Protocol.strencode(JSON.stringify(handshakeBuffer)));
	socket.write(obj);
});

socket.on('data', function (data) {
	console.log("data:" + data);
	var da = Package.decode(data);

	// 握手
	if (da.type == Package.TYPE_HANDSHAKE) {
		var obj = Package.encode(Package.TYPE_HANDSHAKE_ACK);
		socket.write(obj);
	}
	// 心跳
	if (da.type == Package.TYPE_HEARTBEAT) {
		setTimeout(function () {
			var hb = Package.encode(Package.TYPE_HEARTBEAT);
			socket.write(hb);
		}, 30000);
	}
	// 数据
	if (da.type == Package.TYPE_DATA) {
		var s = da.body.toString('utf-8');
		console.log(s);
	}
});

socket.on('error', function (error) {
	logger.error("与中央服务器连接发生异常:" + JSON.stringify(error));
});

socket.on('close', function () {
	logger.error("与中央服务器连接被关闭");
});

socket.sendMsg = function (route, obj) {
	var msg = Protocol.strencode(JSON.stringify(obj));
	msg = Message.encode(0, Message.TYPE_REQUEST, 0, route, msg);
	var packet = Package.encode(Package.TYPE_DATA, msg);
	console.log(console.log(packet));
	socket.write(packet);
};

socket.destory = function () {
	socket.destory();
};
exports.socket = socket;