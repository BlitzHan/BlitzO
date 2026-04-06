import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const roomCodeRef = useRef(null);
  const [error, setError] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [myNickname, setMyNickname] = useState(null);
  const [myHand, setMyHand] = useState([]);
  const [topCard, setTopCard] = useState(null);
  const [activeColor, setActiveColor] = useState(null);
  const [currentPlayerSocket, setCurrentPlayerSocket] = useState(null);
  const [direction, setDirection] = useState(1);
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [round, setRound] = useState(1);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [gameResult, setGameResult] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCard, setPendingCard] = useState(null);
  const [canPlayDrawnCard, setCanPlayDrawnCard] = useState(false);
  const [unoCalled, setUnoCalled] = useState(false);
  const [drawAnimation, setDrawAnimation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    socketRef.current = io('/', {
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected! ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError('Sunucuya bağlanılamadı');
    });

    socket.on('error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 5000);
    });

    socket.on('roomCreated', ({ roomCode: rc, roomName: rn, game }) => {
      roomCodeRef.current = rc;
      setRoomCode(rc);
      setRoomName(rn);
      setPlayers(game.players);
      setScores(game.scores);
      setGameStatus(game.status);
      navigate(`/lobby/${rc}`);
    });

    socket.on('roomJoined', ({ roomCode: rc, roomName: rn, game }) => {
      roomCodeRef.current = rc;
      setRoomCode(rc);
      setRoomName(rn);
      setPlayers(game.players);
      setScores(game.scores);
      setGameStatus(game.status);
      navigate(`/lobby/${rc}`);
    });

    socket.on('playerJoined', ({ game }) => {
      setPlayers(game.players);
      setScores(game.scores);
    });

    socket.on('playerLeft', ({ game }) => {
      setPlayers(game.players);
      setScores(game.scores);
    });

    socket.on('gameStarted', ({ topCard: tc, activeColor: ac, currentPlayer, direction: dir, round: r }) => {
      setTopCard(tc);
      setActiveColor(ac);
      setCurrentPlayerSocket(currentPlayer);
      setDirection(dir);
      setGameStatus('playing');
      if (r) setRound(r);
      navigate(`/game/${roomCodeRef.current}`);
    });

    socket.on('yourHand', ({ hand, currentPlayer }) => {
      setMyHand(hand);
      setCurrentPlayerSocket(currentPlayer);
    });

    socket.on('updateHand', ({ hand, playerCount }) => {
      setMyHand(hand);
      setPlayers(prev => prev.map(p => {
        const updated = playerCount.find(pc => pc.nickname === p.nickname);
        return updated ? { ...p, handCount: updated.handCount } : p;
      }));
    });

    socket.on('cardPlayed', ({ card, player, activeColor: ac, direction: dir, currentPlayer, autoUno, unoPlayer }) => {
      if (card) setTopCard(card);
      setActiveColor(ac);
      if (dir) setDirection(dir);
      if (currentPlayer) setCurrentPlayerSocket(currentPlayer);
      if (autoUno && unoPlayer) {
        setUnoCalled(true);
        setTimeout(() => setUnoCalled(false), 2000);
      }
    });

    socket.on('unoPenalized', ({ targetNickname, drawnCards }) => {
      setError(`${targetNickname} UNO cezası aldı! +${drawnCards} kart`);
      setTimeout(() => setError(null), 3000);
    });

    socket.on('cardDrawn', ({ drawnCard, canPlay }) => {
      setDrawAnimation(true);
      setTimeout(() => setDrawAnimation(false), 600);
      if (canPlay) {
        setCanPlayDrawnCard(true);
      }
    });

    socket.on('penaltyCards', ({ player, count }) => {
      setError(`${player} +${count} ceza kartı çekti!`);
      setTimeout(() => setError(null), 3000);
    });

    socket.on('penaltyCards', ({ player, count }) => {
      setError(`${player} +${count} ceza kartı çekti!`);
      setTimeout(() => setError(null), 3000);
    });

    socket.on('gameEnded', (result) => {
      setGameResult(result);
      setGameStatus('finished');
      setScores(result.allScores);
      navigate(`/scoreboard/${roomCodeRef.current}`);
    });

    socket.on('unoCalled', ({ player }) => {
      setUnoCalled(true);
      setTimeout(() => setUnoCalled(false), 2000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback((roomName, password, nickname) => {
    setError(null);
    setMyNickname(nickname);
    socketRef.current.emit('createRoom', { roomName, password, nickname });
  }, []);

  const joinRoom = useCallback((roomCode, password, nickname) => {
    setError(null);
    setMyNickname(nickname);
    socketRef.current.emit('joinRoom', { roomCode, password, nickname });
  }, []);

  const startGame = useCallback(() => {
    socketRef.current.emit('startGame', { roomCode: roomCodeRef.current });
  }, []);

  const playCard = useCallback((cardId, chosenColor = null) => {
    socketRef.current.emit('playCard', { roomCode: roomCodeRef.current, cardId, chosenColor });
    setShowColorPicker(false);
    setPendingCard(null);
  }, []);

  const drawCard = useCallback(() => {
    setCanPlayDrawnCard(false);
    socketRef.current.emit('drawCard', { roomCode: roomCodeRef.current });
  }, []);

  const callUno = useCallback(() => {
    socketRef.current.emit('callUno', { roomCode: roomCodeRef.current });
  }, []);

  const startNewRound = useCallback(() => {
    socketRef.current.emit('startNewRound', { roomCode: roomCodeRef.current });
    setGameResult(null);
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current.emit('leaveRoom', { roomCode: roomCodeRef.current });
    roomCodeRef.current = null;
    setRoomCode(null);
    setRoomName(null);
    setMyHand([]);
    setPlayers([]);
    setTopCard(null);
    setActiveColor(null);
    setCurrentPlayerSocket(null);
    setGameStatus('waiting');
    setGameResult(null);
    setMyNickname(null);
    navigate('/');
  }, [navigate]);

  const requestColorPick = useCallback((card) => {
    setPendingCard(card);
    setShowColorPicker(true);
  }, []);

  const handleColorPick = useCallback((color) => {
    if (pendingCard) {
      playCard(pendingCard.id, color);
    }
  }, [pendingCard, playCard]);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      error,
      roomCode,
      roomName,
      myNickname,
      myHand,
      topCard,
      activeColor,
      currentPlayerSocket,
      direction,
      players,
      scores,
      round,
      gameStatus,
      gameResult,
      showColorPicker,
      canPlayDrawnCard,
      unoCalled,
      drawAnimation,
      createRoom,
      joinRoom,
      startGame,
      playCard,
      drawCard,
      callUno,
      startNewRound,
      leaveRoom,
      requestColorPick,
      handleColorPick,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}
