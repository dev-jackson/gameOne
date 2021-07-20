const moment = require('moment');

function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a')
  };
}

function shuffleCards(cards){
  cardsShuffled = [];
  numCardsHand = 5;
  ranNumCard = 0;
  for(var i =0; i<numCardsHand;i++){
    indexCard = Math.floor(Math.random() + (cards.length-1));
    nameCard = cards[indexCard]['code'];
    cardsShuffled.push(cards.splice(indexCard,1));
  }
  return cardsShuffled;
}

function addCard(cards){
  indexCard = Math.floor(Math.random() + (cards.length -1));
  codeCard = cards[indexCard]['code'];
  cards.splice(indexCard,1);
  return codeCard;
}
module.exports = {formatMessage, shuffleCards, addCard};
