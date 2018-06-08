function divEscapedContentElement(message) {
    return $('<div></div>').text(message);


}


function divSystemContentElement(message) {

    return $('<div></div>').html('<i>' + message + '</i>');

}

function processUserInput(chatApp, socket) {
    var message = $('#send-message').val();

    var systemMessage;

    // if message begins from '/' - it's commands for app

    if (message.charAt(0) == '/'){
        systemMessage = chatApp.processCommand(message);
        if (systemMessage) {

            $('#messages').append(divSystemContentElement(systemMessage));
        }
    } else {

        // rendering  user's entered data

        chatApp.sendMessage($('#room').text(), message);
        $('#messages').append(divEscapedContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));


    }
    $('#send-message').val('');

}

var socket = io.connect();

$(document).ready(function () {

    var chatApp = new Chat(socket);

    // rendering result of attempt of changing name

    socket.on('nameResult', function (result) {

        var message;

        if (result.success) {
            message = 'You are now knows as ' + result.name + '.';


        } else {

            message = result.message;

        }
        $('#messages').append(divSystemContentElement(message));
    });

// rendering result of changing of room

    socket.on('joinResult', function (result) {

        $('#room').text(result.room);

        $('#messages').append(divSystemContentElement('Room changed.'));



    });

    // render received messages

    socket.on('message', function (message) {

        var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);

    });

    // render list of allowed rooms

    socket.on('rooms', function (rooms) {

        $('#room-list').empty();
        for (var room in rooms) {
            room = room.substring(1, room.length);

            if (room != ''){

                $('#room-list').append(divEscapedContentElement(room));
            }
        }

        // you can click on room for choose another room

        $('#room-list').click(function () {
            chatApp.processCommand('/join' + $(this).text());
            $('#send-message').focus();
        });

    });


    // request list of allowed rooms

    setInterval(function () {
        socket.emit('rooms');

    }, 1000);

    $('#send-message').focus();

    // sending chat  message through form
    $('#send-form').submit(function () {
        processUserInput(chatApp, socket);
        return false;
    });


});
















