const Deck = require('./Deck');

class Game {
  constructor(roomCode, host) {
    this.roomCode = roomCode;
    this.host = host;
    this.players = [];
    this.deck = null;
    this.currentPlayerIndex = 0;
    this.direction = 1;
    this.status = 'waiting';
    this.topCard = null;
    this.activeColor = null;
    this.unoCalled = new Set();
    this.scores = {};
    this.round = 1;
    this.lastActivity = Date.now();
  }

  addPlayer(socketId, nickname) {
    if (this.players.length >= 10) {
      return { error: 'Oda dolu (maksimum 10 oyuncu)' };
    }
    if (this.status !== 'waiting') {
      return { error: 'Oyun zaten başladı' };
    }
    if (this.players.some(p => p.nickname.toLowerCase() === nickname.toLowerCase())) {
      return { error: 'Bu nick zaten kullanımda' };
    }

    const player = {
      socketId,
      nickname,
      hand: [],
      isHost: this.players.length === 0,
    };
    this.players.push(player);
    this.scores[nickname] = this.scores[nickname] || 0;
    return { player };
  }

  removePlayer(socketId) {
    const index = this.players.findIndex(p => p.socketId === socketId);
    if (index === -1) return null;

    const player = this.players.splice(index, 1)[0];

    if (this.status === 'playing') {
      if (this.players.length < 2) {
        this.status = 'finished';
        return { player, gameEnded: true };
      }

      if (index <= this.currentPlayerIndex) {
        this.currentPlayerIndex = Math.max(0, this.currentPlayerIndex - 1);
      }
    }

    if (player.isHost && this.players.length > 0) {
      this.players[0].isHost = true;
      this.host = this.players[0].socketId;
    }

    return { player, gameEnded: this.status === 'finished' };
  }

  startGame() {
    if (this.players.length < 2) {
      return { error: 'En az 2 oyuncu gerekli' };
    }
    if (this.status !== 'waiting') {
      return { error: 'Oyun zaten başladı' };
    }

    this.deck = new Deck();
    this.players.forEach(p => { p.hand = []; });
    this.unoCalled.clear();

    this.players.forEach(player => {
      player.hand = this.deck.draw(7);
    });

    let firstCard = this.deck.draw(1)[0];
    while (firstCard.type === 'wild') {
      this.deck.discard(firstCard);
      firstCard = this.deck.draw(1)[0];
    }

    this.deck.discard(firstCard);
    this.topCard = firstCard;
    this.activeColor = firstCard.color;
    this.currentPlayerIndex = 0;
    this.direction = 1;
    this.status = 'playing';
    this.lastActivity = Date.now();

    if (firstCard.type === 'special' && firstCard.value === 'skip') {
      this.currentPlayerIndex = this.getNextPlayerIndex();
    }

    return {
      topCard: this.topCard,
      activeColor: this.activeColor,
      currentPlayer: this.getCurrentPlayer(),
      direction: this.direction,
    };
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getNextPlayerIndex() {
    let next = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length;
    return next;
  }

  canPlayCard(card) {
    if (!this.topCard) return false;

    if (card.type === 'wild') return true;
    if (card.color === this.activeColor) return true;
    if (card.type === 'number' && this.topCard.type === 'number' && card.value === this.topCard.value) return true;
    if (card.type === 'special' && this.topCard.type === 'special' && card.value === this.topCard.value) return true;
    if (card.type === 'number' && this.topCard.type === 'special' && String(card.value) === String(this.topCard.value)) return true;
    if (card.type === 'special' && this.topCard.type === 'number' && String(card.value) === String(this.topCard.value)) return true;

    return false;
  }

  playCard(socketId, cardId, chosenColor = null) {
    if (this.status !== 'playing') {
      return { error: 'Oyun oynanmıyor' };
    }

    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.socketId !== socketId) {
      return { error: 'Sıra sizde değil' };
    }

    const cardIndex = currentPlayer.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return { error: 'Kart bulunamadı' };
    }

    const card = currentPlayer.hand[cardIndex];

    if (!this.canPlayCard(card)) {
      return { error: 'Bu kartı oynayamazsınız' };
    }

    if (card.type === 'wild' && !chosenColor) {
      return { error: 'Renk seçmelisiniz', needColor: true };
    }

    if (currentPlayer.hand.length === 2 && !this.unoCalled.has(socketId)) {
      this.unoCalled.add(socketId);
    }

    currentPlayer.hand.splice(cardIndex, 1);
    this.deck.discard(card);
    this.topCard = card;

    if (card.type === 'wild') {
      this.activeColor = chosenColor;
    } else {
      this.activeColor = card.color;
    }

    this.lastActivity = Date.now();

    if (currentPlayer.hand.length === 0) {
      this.endGame(currentPlayer);
      return {
        card,
        player: currentPlayer.nickname,
        activeColor: this.activeColor,
        gameEnded: true,
        winner: currentPlayer.nickname,
      };
    }

    if (currentPlayer.hand.length === 1) {
      this.unoCalled.add(socketId);
    }

    let skipNext = false;
    let drawCards = 0;

    if (card.type === 'special') {
      if (card.value === 'skip') {
        skipNext = true;
      } else if (card.value === 'reverse') {
        if (this.players.length === 2) {
          skipNext = true;
        } else {
          this.direction *= -1;
        }
      } else if (card.value === 'draw2') {
        drawCards = 2;
        skipNext = true;
      }
    } else if (card.type === 'wild' && card.value === 'wild4') {
      drawCards = 4;
      skipNext = true;
    }

    this.currentPlayerIndex = this.getNextPlayerIndex();

    if (drawCards > 0) {
      const targetPlayer = this.getCurrentPlayer();
      const drawnCards = this.deck.draw(drawCards);
      targetPlayer.hand.push(...drawnCards);
    }

    if (skipNext) {
      this.currentPlayerIndex = this.getNextPlayerIndex();
    }

    return {
      card,
      player: currentPlayer.nickname,
      activeColor: this.activeColor,
      currentPlayer: this.getCurrentPlayer(),
      direction: this.direction,
      drawnCards: drawCards,
      skipped: skipNext,
      autoUno: currentPlayer.hand.length === 1,
      unoPlayer: currentPlayer.hand.length === 1 ? currentPlayer.nickname : null,
    };
  }

  drawCard(socketId) {
    if (this.status !== 'playing') {
      return { error: 'Oyun oynanmıyor' };
    }

    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.socketId !== socketId) {
      return { error: 'Sıra sizde değil' };
    }

    if (this.hasDrawnThisTurn) {
      this.currentPlayerIndex = this.getNextPlayerIndex();
      this.hasDrawnThisTurn = false;
      return { 
        passed: true, 
        currentPlayer: this.getCurrentPlayer(), 
        direction: this.direction 
      };
    }

    const drawnCards = this.deck.draw(1);
    if (drawnCards.length === 0) {
      return { error: 'Deste boş' };
    }

    const drawnCard = drawnCards[0];
    currentPlayer.hand.push(drawnCard);
    this.lastActivity = Date.now();
    this.hasDrawnThisTurn = true;

    const canPlay = this.canPlayCard(drawnCard);

    if (!canPlay) {
      this.currentPlayerIndex = this.getNextPlayerIndex();
      this.hasDrawnThisTurn = false;
      return {
        drawnCard,
        canPlay: false,
        currentPlayer: this.getCurrentPlayer(),
        direction: this.direction,
      };
    }

    return {
      drawnCard,
      canPlay: true,
    };
  }

  callUno(socketId) {
    const player = this.players.find(p => p.socketId === socketId);
    if (!player) return { error: 'Oyuncu bulunamadı' };

    if (player.hand.length <= 2) {
      this.unoCalled.add(socketId);
      return { success: true };
    }
    return { error: 'UNO çağırmak için 2 veya daha az kartınız olmalı' };
  }

  endGame(winner) {
    this.status = 'finished';

    let totalPoints = 0;
    const cardDetails = {};

    for (const player of this.players) {
      if (player.socketId === winner.socketId) continue;

      let playerPoints = 0;
      const details = [];

      for (const card of player.hand) {
        let points;
        if (card.type === 'number') {
          points = card.value;
        } else if (card.type === 'special') {
          points = 20;
        } else {
          points = 50;
        }
        playerPoints += points;
        details.push({ card, points });
      }

      totalPoints += playerPoints;
      cardDetails[player.nickname] = { points: playerPoints, details, cardCount: player.hand.length };
    }

    this.scores[winner.nickname] = (this.scores[winner.nickname] || 0) + totalPoints;

    return {
      winner: winner.nickname,
      roundPoints: totalPoints,
      totalScore: this.scores[winner.nickname],
      cardDetails,
      allScores: { ...this.scores },
    };
  }

  startNewRound() {
    this.deck = new Deck();
    this.players.forEach(p => { p.hand = []; });
    this.unoCalled.clear();

    this.players.forEach(player => {
      player.hand = this.deck.draw(7);
    });

    let firstCard = this.deck.draw(1)[0];
    while (firstCard.type === 'wild') {
      this.deck.discard(firstCard);
      firstCard = this.deck.draw(1)[0];
    }

    this.deck.discard(firstCard);
    this.topCard = firstCard;
    this.activeColor = firstCard.color;
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.direction = 1;
    this.status = 'playing';
    this.lastActivity = Date.now();

    return {
      topCard: this.topCard,
      activeColor: this.activeColor,
      currentPlayer: this.getCurrentPlayer(),
      direction: this.direction,
      round: ++this.round,
    };
  }

  getState() {
    return {
      roomCode: this.roomCode,
      roomName: this.roomName,
      players: this.players.map(p => ({
        nickname: p.nickname,
        handCount: p.hand.length,
        isHost: p.isHost,
      })),
      status: this.status,
      currentPlayer: this.status === 'playing' ? this.getCurrentPlayer()?.nickname : null,
      direction: this.direction,
      scores: { ...this.scores },
      round: this.round,
    };
  }
}

module.exports = Game;
