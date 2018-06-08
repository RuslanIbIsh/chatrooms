var Chat = function (socket) {
    this.socket = socket;
};

//

Chat.prototype.sendMessage = function (room, text) {
    var message = {
      room: room,
      text: text
    };
    this.socket.emit('message', message);

};



Chat.prototype.changeRoom = function (room) {
   this.socket.emit('join', {
       newRoom: room
   });
};


// join - join to exist room or to user's created room
// nick - changing nickname


Chat.prototype.processCommand = function (command) {

    var words = command.split('');
    var command = words[0]

    // command of static parsing, begins from first word

    .substring(1, words[0].length)
        .toLowerCase();
    var message = false;

    switch (command){
        case 'join':
            words.shift();
            var room = words.join('');
            // handle of changing / creation chat room
            this.changeRoom(room);
            break;
        case 'nick':
            words.shift();
            var name = words.join('');
            // handle attempts of changing chat user's name

            this.socket.emit('nameAttempt', name);
            break;

        default:
            // feedback with mistake, if command doesn't recognize
            message = 'Unrecognized command';
            break;

    }

    return message;

};








