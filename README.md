# QuickSocket
QuickSocket is base on Socket(TCP)

QuickSocket协议部分

1、标志位：QS，长度16位
2、帧类型：1~255，长度8位，目前定义三种类型，可扩展
  0 -> 保留，不可用
  1 -> MSG 消息类型
  2 -> PING 主动心跳包
  3 -> PONG 返回心跳包
  
3、数据长度：0 ~ 65535，长度16位，如果超过最大长度会丢弃超出部分数据
4、校验码：0 ~ 255， 长度8位，校验协议头部数据，校验码计算方式：头部所有字节取异或
5、数据：长度 0 ~ 65535字节

https://www.jianshu.com/p/c84cf595ffc5
