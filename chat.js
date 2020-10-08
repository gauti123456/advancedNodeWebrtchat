var express = require('express');
var dl  = require('delivery');
var fs  = require('fs');
var path = require('path');
var emoji = require('node-emoji');
var PORT = process.env.PORT || 3000
var format = function (code, name) {
  return '<img alt="' + code + '" src="/public/img/apple40/' + name + '.png" />';
};
var usernames={};
datainfo="";	
	app = express(),
	
	app.use('/public', express.static(path.join(__dirname + '/public')));

	
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);
	server.listen(PORT);
	app.get('/',function(req,res){
		res.sendFile(__dirname+'/chat.html');
	});
	io.sockets.on('connection',function(socket){
		// new user enter in chat
		socket.on('adduser', function(username){
        socket.username = username;
        usernames[username] = socket.id;
        console.log(username+' has connected to the server');
        io.sockets.emit('friend',username);
        io.to(usernames[username]).emit("friends",usernames);
    
    		});

		socket.on('send_user',function(data){
			io.to(usernames[data.to]).emit("type_user",data);
		});	
		socket.on('nosend_user',function(data){
			io.to(usernames[data.to]).emit("notype_user",data);
		});
		socket.on('send_message',function(data){
			message_data=emoji.emojify(data.message, null, format);
			console.log(message_data);
			data1={
				"from" :data.from,
				"to":data.to,
				"message":message_data
			};	
			io.to(usernames[data.from]).emit("new message",data1);
			io.to(usernames[data.to]).emit("new message",data1);
	
		});

		var delivery = dl.listen(socket);
  		delivery.on('receive.success',function(file,info){
    		
    		datainfo=file.params;
    		buf=file.buffer;

    		io.to(usernames[datainfo.to]).emit("image", { image: true, buffer: buf.toString('base64') ,datainfo });
			io.to(usernames[datainfo.from]).emit("image", { image: true, buffer: buf.toString('base64') ,datainfo });
 			console.log(datainfo);




  });

	});

