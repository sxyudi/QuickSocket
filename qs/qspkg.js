/* * * * * * * * * * * * * * * * * * * * * * * * * 
	flag : 16, //QS
	type : 8, //帧类型
	dataLength : 16, //数据长度
	checkCode : 8 //校验码
 */
const FLAG_Q = 'Q'.charCodeAt(0);
const FLAG_S = 'S'.charCodeAt(0);

const qspkg = {
	// 根据封包协议我们计算包头校验码;
	calc_head_sum: function(pkg_data, offset) {
		let sum = 0;
		for (let i = 0; i < qspkg.HEAD_LEN - 1; i++) {
			let b = pkg_data.readUInt8(offset + i);
			sum = sum ^ b;
		}
		return sum;
	},

	/*
	find_next_flag : function (pkg_data, offset) {
		while (offset < pkg_data.length) {
			let q = pkg_data.readUInt8(offset);
			if (q === FLAG_Q) {
				break;
			}
			offset++;
		}
		return offset;
	},
	*/

	// 根据封包协议我们读取包头;
	read_pkg_head: function(pkg_data, offset) {
		const head = {};
		while (offset + qspkg.HEAD_LEN <= pkg_data.length) {
			const q = pkg_data.readUInt8(offset);
			const s = pkg_data.readUInt8(offset + 1);
			const type = pkg_data.readUInt8(offset + 2);
			const len = pkg_data.readUInt16LE(offset + 3);
			const code = pkg_data.readUInt8(offset + 5);
			if (q !== FLAG_Q || s !== FLAG_S) {
				offset++;
				head.offset = offset;
			} else if (qspkg.calc_head_sum(pkg_data, offset) !== code) {
				offset++;
				head.offset = offset;
			} else {
				head.type = type;
				head.offset = offset + qspkg.HEAD_LEN;
				head.len = len;
				break;
			}
		}
		return head;
	},

	// 把一个要发送的数据,封包 包头 + 数据
	// data string 二进制的buffer
	package_data: function(type, data) {
		const data_len = data ? data.length : 0;
		const buf = Buffer.allocUnsafe(qspkg.HEAD_LEN + data_len);
		buf.writeUInt8(FLAG_Q, 0);
		buf.writeUInt8(FLAG_S, 1);
		buf.writeUInt8(type, 2);
		buf.writeUInt16LE(data_len, 3);
		buf.writeUInt8(qspkg.calc_head_sum(buf, 0), 5);
		if (data_len > 0) {
			buf.fill(data, qspkg.HEAD_LEN);
		}
		return buf;
	},
};

qspkg.TYPE_MSG = 1;
qspkg.TYPE_PING = 2;
qspkg.TYPE_PONG = 3;

qspkg.HEAD_LEN = 6;

module.exports = qspkg;