const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const actualNumsCards = document.getElementById('numsCards');
var userTurn;
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
    addCard(card[0]['code'],card[0]['message']);
  })
});

socket.on('actualNumDeck', (numsCards)=>{
  setNumCards(numsCards);
});

function setNumCards(numCard){
  actualNumsCards.innerText = numCard;
}
// Message from server
socket.on('message', (message) => {
  turnNameUser = message.username;
  console.log(message, turnNameUser);

  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('turn',(turn)=>{
  btn = document.getElementById('btn')
  if(turn){
    btn.disabled = false;
  }else{
    btn.disabled = true;
  }
})
socket.on('addCard', (card) =>{
  console.log(card);
  addCard(card.code,card.message);
});
// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let card;
  var binaryCode;
  var uTurn =true;
    if(document.querySelector('.selected') == undefined){
      alert('Selecione carta');
      return false;
    }else{
          card = document.querySelector('.selected');
          binaryCode = binaryEncode(card.getAttribute('msg'));
          card.remove();
    }
socket.emit('userTurn');
socket.emit('chatMessage', binaryCode);
  // Get message text
  // let msg = e.target.elements.msg.value;
  // msg = msg.trim();

  // if (!msg) {
  //   return false;
  // }

  // Emit message to server
  //socket.emit('chatMessage', binaryCode);

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
  let verifyBinary = new RegExp(/[01]+/);
  if(verifyBinary.test(message.text)){
    para.innerHTML = message.text + " => " + binaryDecode(message.text)
  }else{
    para.innerText = message.text;
  }
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
    li.setAttribute('class', 'row');
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

function addCard(nameOfCard,msgOfCard){
  const li = document.createElement('li');
  const input = document.createElement('input');
  input.type = "checkbox";
  input.setAttribute('id', 'cb1');
  const label = document.createElement('label');
  const image = document.createElement('img');
  image.src = `./images/${nameOfCard}.png`;
  li.setAttribute('id', nameOfCard);
  li.setAttribute('msg', msgOfCard);
  li.setAttribute('onclick',"addSelectedCard(this.id)")
  label.appendChild(image);
  //li.appendChild(input);
  li.appendChild(label);
  document.querySelector('.hand').appendChild(li);
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
function addSelectedCard(idHtmlCard){
  var card = document.getElementById(idHtmlCard);
  if(document.querySelector('.selected') != undefined){
    document.querySelector('.selected').classList.remove('selected');
    card.classList.add('selected');
  }else{
    card.classList.add('selected');
  }
  
  
}


function binaryEncode(text){
  text = unescape(encodeURIComponent(text));
  var chr, i =0 ,l = text.length, out = '';
  for(; i<l; i++){
    chr = text.charCodeAt( i ).toString( 2 );
    while( chr.length % 8 != 0 ){ chr = '0' + chr; }
    out += chr;
  }
  return out;
}

function binaryDecode(binary){
  var i = 0, l = binary.length, chr, out = '';
  for(; i < l; i += 8 ){
      chr = parseInt( binary.substr( i, 8 ), 2 ).toString( 16 );
      out += '%' + ( ( chr.length % 2 == 0 ) ? chr : '0' + chr );
  }
  return decodeURIComponent(out);
}
