const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const RoomManager = require('./game/RoomManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const roomManager = new RoomManager();

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', rooms: roomManager.getRoomCount() });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('createRoom', ({ roomName, password, nickname }) => {
    try {
      const result = roomManager.createRoom(roomName, password, socket.id, nickname);
      if (result.error) {
        socket.emit('error', { message: result.error });
        return;
      }

      socket.join(result.roomCode);
      socket.emit('roomCreated', {
        roomCode: result.roomCode,
        roomName: result.roomName,
        game: result.game,
      });
    } catch (err) {
      socket.emit('error', { message: 'Oda oluşturulamadı' });
    }
  });

  socket.on('joinRoom', ({ roomCode, password, nickname }) => {
    try {
      const result = roomManager.joinRoom(roomCode, password, socket.id, nickname);
      if (result.error) {
        socket.emit('error', { message: result.error });
        return;
      }

      socket.join(result.roomCode);
      socket.emit('roomJoined', {
        roomCode: result.roomCode,
        roomName: result.roomName,
        game: result.game,
      });

      io.to(result.roomCode).emit('playerJoined', { game: result.game });
    } catch (err) {
      socket.emit('error', { message: 'Odaya katılamadınız' });
    }
  });

  socket.on('startGame', ({ roomCode }) => {
    try {
      const game = roomManager.getRoom(roomCode);
      if (!game) {
        socket.emit('error', { message: 'Oda bulunamadı' });
        return;
      }

      const result = game.startGame();
      if (result.error) {
        socket.emit('error', { message: result.error });
        return;
      }

      io.to(roomCode).emit('gameStarted', {
        topCard: result.topCard,
        activeColor: result.activeColor,
        currentPlayer: result.currentPlayer.socketId,
        direction: result.direction,
      });

      game.players.forEach(player => {
        io.to(player.socketId).emit('yourHand', {
          hand: player.hand,
          currentPlayer: result.currentPlayer.socketId,
        });
      });
    } catch (err) {
      socket.emit('error', { message: 'Oyun başlatılamadı' });
    }
  });

  socket.on('playCard', ({ roomCode, cardId, chosenColor }) => {
    try {
      const game = roomManager.getRoom(roomCode);
      if (!game) {
        socket.emit('error', { message: 'Oda bulunamadı' });
        return;
      }

      const result = game.playCard(socket.id, cardId, chosenColor);
      if (result.error) {
        socket.emit('error', { message: result.error });
        return;
      }

      io.to(roomCode).emit('cardPlayed', {
        card: result.card,
        player: result.player,
        activeColor: result.activeColor,
        direction: result.direction,
        currentPlayer: result.currentPlayer?.socketId,
        drawnCards: result.drawnCards,
        skipped: result.skipped,
        autoUno: result.autoUno,
        unoPlayer: result.unoPlayer,
      });

      if (result.drawnCards > 0) {
        const targetPlayer = game.players.find(p => p.socketId === result.currentPlayer?.socketId);
        io.to(roomCode).emit('penaltyCards', {
          player: targetPlayer?.nickname || 'Oyuncu',
          count: result.drawnCards,
        });
      }

      game.players.forEach(player => {
        io.to(player.socketId).emit('updateHand', {
          hand: player.hand,
          playerCount: game.players.map(p => ({
            nickname: p.nickname,
            handCount: p.hand.length,
          })),
        });
      });

      if (result.gameEnded) {
        const gameResult = game.endGame(game.players.find(p => p.nickname === result.winner));
        io.to(roomCode).emit('gameEnded', {
          winner: gameResult.winner,
          roundPoints: gameResult.roundPoints,
          totalScore: gameResult.totalScore,
          cardDetails: gameResult.cardDetails,
          allScores: gameResult.allScores,
        });
      }
    } catch (err) {
      socket.emit('error', { message: 'Kart oynanamadı' });
    }
  });

  socket.on('drawCard', ({ roomCode }) => {
    try {
      const game = roomManager.getRoom(roomCode);
      if (!game) {
        socket.emit('error', { message: 'Oda bulunamadı' });
        return;
      }

      const result = game.drawCard(socket.id);
      if (result.error) {
        socket.emit('error', { message: result.error });
        return;
      }

      socket.emit('cardDrawn', {
        drawnCard: result.drawnCard,
        canPlay: result.canPlay,
      });

      if (!result.canPlay) {
        io.to(roomCode).emit('cardPlayed', {
          card: null,
          player: game.players.find(p => p.socketId === socket.id)?.nickname,
          activeColor: game.activeColor,
          direction: game.direction,
          currentPlayer: result.currentPlayer?.socketId,
          drawn: true,
        });
      }

      game.players.forEach(player => {
        io.to(player.socketId).emit('updateHand', {
          hand: player.hand,
          playerCount: game.players.map(p => ({
            nickname: p.nickname,
            handCount: p.hand.length,
          })),
        });
      });
    } catch (err) {
      socket.emit('error', { message: 'Kart çekilemedi' });
    }
  });

      if (!result.canPlay) {
        io.to(roomCode).emit('cardPlayed', {
          card: null,
          player: game.players.find(p => p.socketId === socket.id)?.nickname,
          activeColor: game.activeColor,
          direction: game.direction,
          currentPlayer: result.currentPlayer?.socketId,
          drawn: true,
        });
      }

      game.players.forEach(player => {
        io.to(player.socketId).emit('updateHand', {
          hand: player.hand,
          playerCount: game.players.map(p => ({
            nickname: p.nickname,
            handCount: p.hand.length,
          })),
        });
      });
    } catch (err) {
      socket.emit('error', { message: 'Kart çekilemedi' });
    }
  });

  socket.on('callUno', ({ roomCode }) => {
    try {
      const game = roomManager.getRoom(roomCode);
      if (!game) {
        socket.emit('error', { message: 'Oda bulunamadı' });
        return;
      }

      const result = game.callUno(socket.id);
      if (result.error) {
        socket.emit('error', { message: result.error });
        return;
      }

      io.to(roomCode).emit('unoCalled', {
        player: game.players.find(p => p.socketId === socket.id)?.nickname,
      });
    } catch (err) {
      socket.emit('error', { message: 'UNO çağrılamadı' });
    }
  });

  socket.on('startNewRound', ({ roomCode }) => {
    try {
      const game = roomManager.getRoom(roomCode);
      if (!game) {
        socket.emit('error', { message: 'Oda bulunamadı' });
        return;
      }

      const result = game.startNewRound();

      io.to(roomCode).emit('gameStarted', {
        topCard: result.topCard,
        activeColor: result.activeColor,
        currentPlayer: result.currentPlayer.socketId,
        direction: result.direction,
        round: result.round,
      });

      game.players.forEach(player => {
        io.to(player.socketId).emit('yourHand', {
          hand: player.hand,
          currentPlayer: result.currentPlayer.socketId,
        });
      });
    } catch (err) {
      socket.emit('error', { message: 'Yeni el başlatılamadı' });
    }
  });

  socket.on('leaveRoom', ({ roomCode }) => {
    try {
      const result = roomManager.removePlayer(roomCode, socket.id);
      if (result) {
        socket.leave(roomCode);

        if (result.game) {
          io.to(roomCode).emit('playerLeft', { game: result.game });
        }

        if (result.game && result.game.status === 'finished') {
          io.to(roomCode).emit('gameEnded', {
            winner: result.removedPlayer?.nickname,
            roundPoints: 0,
            totalScore: 0,
            cardDetails: {},
            allScores: result.game.scores,
          });
        }
      }
    } catch (err) {
      console.error('Leave room error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    for (const [code, game] of roomManager.rooms) {
      const player = game.players.find(p => p.socketId === socket.id);
      if (player) {
        const result = roomManager.removePlayer(code, socket.id);
        if (result) {
          if (result.game) {
            io.to(code).emit('playerLeft', { game: result.game });
          }
          if (result.gameEnded) {
            io.to(code).emit('gameEnded', {
              winner: 'Oyun iptal edildi',
              roundPoints: 0,
              totalScore: 0,
              cardDetails: {},
              allScores: {},
            });
          }
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`⚡ BlitzO! server running on port ${PORT}`);
});
