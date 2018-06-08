var socketio = require('socket.io');

var io;

var guestNumber = 1;

var nickNames = {};

var namesUsed = [];

var currentRoom = {};



exports.listen = function (server) {

// run serverio server for executing with existing http server

    io = socketio.listen(server);

    io.set('log level', 1);

    // define approach of handling each user's connection

    io.sockets.on('connection', function (socket) {

        // assign the name "guest"  for the connected user
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);

        // nesting connected user in room Lobby

        joinRoom(socket, "Lobby");

        // handling users messages
        // attempts of changing name and attempts of creating / changing rooms

        handleMessageBroadcasting(socket, nickNames);

        handleNameChangeAttempts(socket, nickNames, namesUsed);

        handleRoomJoining(socket);

        // render list of busy rooms for user's request

        socket.on('rooms', function () {

            // todo githab decision case 1
       //     socket.emit('rooms', io.sockets.manager.rooms);

            socket.emit('rooms', io.of('/').adapter.rooms);

        });

        // define logic of cleaning,  which is running after sign out from chat

        handleClientDisconnection(socket, nickNames, namesUsed);


    });


};

// assign - prisvaivanie

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
    // creating new guest name
    var name = 'Guest' + guestNumber;

    // binding guest name with user connection id (identification)

    nickNames[socket.id] = name;

    // message to user with his guest name
    socket.emit('nameResult', {
        success: true,
        name: name
    });

    // pay attention that guest's name is using

    namesUsed.push(name);

    return guestNumber + 1;



}


// sign in room chat

function joinRoom(socket, room) {

    // enter into room

    socket.join(room);

    // detection of user in the room
    currentRoom[socket.id] = room;

    // alarming user that his is in the new room
    socket.emit('joinResult', {room: room});

    // alarming of over users about of new guest in the room

    socket.broadcast.to(room).emit('message', {
       text: nickNames[socket.id] + 'has joined' + room + '.'
    });

    // identification over users are in the same room
    // var usersInRoom = io.sockets.clients(room);

    // todo case 1  checked form github decision sth with version of socetio

    var usersInRoom = io.of('/').in(room).clients;




    // if over users is in this  room , count them

    if (usersInRoom.length > 1){

        var usersInRoomSummary = 'Users currently in ' + room + ':';

        for (var index in usersInRoom) {
            var userSocketId = usersInRoom[index].id;
            if (userSocketId != socket.id) {
                if (index > 0){
                    usersInRoomSummary += ', ';
                }

                usersInRoomSummary += nickNames[userSocketId];
            }

        }

        usersInRoomSummary += '.';

        // render report about over users in the room

        socket.emit('message', {text: usersInRoomSummary});
    }



}



function handleNameChangeAttempts(socket, nickNames, namesUsed) {

    // add event listener nameAttempt

    socket.on('nameAttempt', function (name) {
        // not allowed names begin from Guest

        if (name.indexOf('Guest') == 0) {
            socket.emit('nameResult', {
            success: false,
            message: 'Names cannot begin with "Guest" .'
            });
        } else {

            // if name doesn't use choose it
            if (namesUsed.indexOf(name) == -1){
                var previousName = nickNames[socket.id];
                var previousNameIndex = namesUsed.indexOf(previousName);

                namesUsed.push(name);

                nickNames[socket.id] = name;

                // delete previous name for new users

                delete namesUsed[previousNameIndex];
/*
                {
                    success: true,
                        name: name
                }*/

                socket.emit('nameResult', {
                    success: true,
                    name: name
                });


                socket.broadcast.to(currentRoom[socket.id]).emit('message',{
                  text: previousName + 'is now known as ' + name + '.'
                });



            } else {
                socket.emit('nameResult', {
                    // if name is reserved, sent mistake to client

                    success: false,
                    message: "That name is already in use."

                });

        }
        }


    });

}


// for broadcasting messages

function handleMessageBroadcasting(socket) {

    socket.on('message', function (message) {

        socket.broadcast.to(message.room).emit('message', {
            text: nickNames[socket.id] + ': ' + message.text
        });

    });

}


function handleRoomJoining(socket) {

    socket.on('join', function (room) {
             socket.leave(currentRoom[socket.id]);
             joinRoom(socket, room.newRoom);
    });

}


// exit from chat

function handleClientDisconnection(socket) {
    socket.on('disconnect', function () {
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });
}















