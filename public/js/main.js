const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on('shuffle', (cardsHand) => {
  cardsHand.forEach((card)=>{
    addCard(card[0]['code']);
  })
});

// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('addCard', (nameCard) =>{
  addCard(nameCard);
});
// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let card;
  var binaryCode;
  if(document.querySelector('.selected') == undefined){
    alert('Selecione carta');
    return false;
  }else{
    card = document.querySelector('.selected');
    binaryCode = binaryEncode(card.getAttribute('id'));
  }
  // Get message text
  // let msg = e.target.elements.msg.value;
  // msg = msg.trim();

  // if (!msg) {
  //   return false;
  // }

  // Emit message to server
  socket.emit('chatMessage', binaryCode);

  // Clear input
  // e.target.elements.msg.value = '';
  // e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});
document.getElementById('deck').addEventListener('click',()=>{
  socket.emit('newCard');
});

function addCard(nameOfCard){
  const li = document.createElement('li');
  const input = document.createElement('input');
  input.type = "checkbox";
  input.setAttribute('id', 'cb1');
  const label = document.createElement('label');
  const image = document.createElement('img');
  image.src = `./images/${nameOfCard}.png`;
  image.setAttribute('id', nameOfCard);
  image.setAttribute('onclick',"addSelectedCard(this.id)")
  label.appendChild(image);
  //li.appendChild(input);
  li.appendChild(label);
  document.querySelector('.hand').appendChild(label);
  console.log(li);
}

// function shuffle(){
//   numCardsHand = 5;
//   ranNumCard = 0;
//   for(var i =0; i<numCardsHand;i++){
//     console.log(cards);
//     indexCard = Math.floor(Math.random() + (cards.length-1));
//     nameCard = cards[indexCard]['code'];
//     addCard(nameCard);
//     cards.splice(indexCard,1);
//   }
// }
var singleSelect = false;
function addSelectedCard(idHtmlCard){
  var card = document.getElementById(idHtmlCard);
  if(card.classList.contains('selected')){
    card.classList.remove('selected');
    singleSelect = false;
  }else{
    if(!singleSelect){
      card.classList.add('selected');
      singleSelect = true;
    }else{
      alert("Solo puedes selecionar una carta");
    }
  }
}

function binaryEncode(text){
  text - unescape(encodeURIComponent(text));
  var chr, i =0 ,l = text.length, out = '';
  for(var i = 0; i<l; i++){
    chr = text.charCodeAt( i ).toString( 2 );
    while( chr.length % 8 != 0 ){ chr = '0' + chr; }
    out += chr;
  }
  return out;
}

function binaryDecode(binary){
  var binary = 0, l = binary.length, chr, out = '';
  for(var i=0 ; i < l; i += 8 ){
      chr = parseInt( binary.substr( i, 8 ), 2 ).toString( 16 );
      out += '%' + ( ( chr.length % 2 == 0 ) ? chr : '0' + chr );
  }
  return decodeURIComponent( out );
}
