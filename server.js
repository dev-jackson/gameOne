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
  getRoomUsers,
  setTurnUser
} = require('./utils/users');
const { version } = require('moment');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
var deckCards = cards();
var turnId;
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Game One Bot';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    let user;
    if(getRoomUsers() == 0){
     user = userJoin(socket.id, username, room, true);
    }else{
      user = userJoin(socket.io,username,room,false);
    }
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

    io.to(user.room).emit('actualNumDeck', deckCards.length);
  });
  socket.on('newCard', () =>{
      const user = getCurrentUser(socket.id);

      io.to(user.id).emit('addCard', addCard(deckCards));
      io.to(user.room).emit('actualNumDeck', deckCards.length);
  })
  // Listen for chatMessage
  socket.on('chatMessage', msgBinary => {
    const user = getCurrentUser(socket.id);
    //console.log(user);
    if(user.turn){
      setTurnUser(user.id);
      io.to(user.room).emit('message', formatMessage(user.username, msgBinary));
      io.to(user.id).emit('turn', user.turn);
      nextUser = getRoomUsers(user.room).find(u=>u.id!=user.id);
      io.to(nextUser.id).emit('turn', nextUser.turn);
    }else{
      io.to(user.room).emit('message',formatMessage(botName, `${user.username} wait your turn`) ); 
      io.to(user.id).emit('turn', user.turn); 
    }
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