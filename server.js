const path = require('path');
const http = require('http');
const cards = require('./data/cards');
const express = require('express');
const socketio = require('socket.io');
const {formatMessage, shuffleCards, addCard} = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
var deckCards = cards();
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Game One Bot';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to Game One!'));

    //shuffle cardsHand
      io.to(user.id)
      .emit('shuffle', shuffleCards(deckCards));
    // Broadcast when a user connects
  
      io.to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the game`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });
  socket.on('newCard', () =>{
      const user = getCurrentUser(socket.id);

      io.to(user.id).emit('addCard', addCard(deckCards));
  })
  // Listen for chatMessage
  socket.on('chatMessage', msgBinary => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msgBinary));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
      if(getRoomUsers(user.room).length == 0){
        deckCards = cards();
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));