const Game = require('./Game');

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(roomName, password, socketId, nickname) {
    const roomCode = this.generateRoomCode();
    const game = new Game(roomCode, socketId);
    game.roomName = roomName;
    game.password = password;

    const result = game.addPlayer(socketId, nickname);
    if (result.error) {
      return { error: result.error };
    }

    this.rooms.set(roomCode, game);
    return { roomCode, roomName, game: game.getState() };
  }

  joinRoom(roomCode, password, socketId, nickname) {
    const roomCodeUpper = roomCode.toUpperCase();
    const game = this.rooms.get(roomCodeUpper);

    if (!game) {
      return { error: 'Oda bulunamadı' };
    }
    if (game.password && game.password !== password) {
      return { error: 'Yanlış şifre' };
    }

    const result = game.addPlayer(socketId, nickname);
    if (result.error) {
      return { error: result.error };
    }

    return { roomCode: roomCodeUpper, roomName: game.roomName, game: game.getState() };
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode.toUpperCase());
  }

  removePlayer(roomCode, socketId) {
    const game = this.rooms.get(roomCode.toUpperCase());
    if (!game) return null;

    const result = game.removePlayer(socketId);
    if (!result) return null;

    if (result.gameEnded || game.players.length === 0) {
      this.rooms.delete(roomCode.toUpperCase());
    }

    return { game: game.players.length > 0 ? game.getState() : null, removedPlayer: result.player };
  }

  cleanup() {
    const now = Date.now();
    const timeout = 30 * 60 * 1000;

    for (const [code, game] of this.rooms) {
      if (now - game.lastActivity > timeout) {
        this.rooms.delete(code);
      }
    }
  }

  getRoomCount() {
    return this.rooms.size;
  }
}

module.exports = RoomManager;
