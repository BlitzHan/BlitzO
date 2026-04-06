import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import './Lobby.css';

function Lobby() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { roomName, players, startGame, leaveRoom, error, gameStatus, myNickname } = useSocket();
  const isHost = players.find(p => p.nickname === myNickname)?.isHost;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (gameStatus === 'playing') {
      navigate(`/game/${roomCode}`);
    }
  }, [gameStatus, navigate, roomCode]);

  const handleStart = () => {
    if (players.length >= 2) {
      startGame();
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="lobby-container">
      <div className="lobby-content">
        <div className="lobby-header">
          <h1 className="blitzo-title" style={{ fontSize: '32px' }}>⚡ BlitzO!</h1>
          <div className="room-info">
            <span className="room-name">{roomName}</span>
          </div>
        </div>

        <div className="room-code-section">
          <span className="room-code-display" onClick={copyCode} title="Kodu kopyalamak için tıkla">
            {roomCode}
          </span>
          <span className={`copy-hint ${copied ? 'copied' : ''}`}>
            {copied ? '✓ Kopyalandı!' : 'Kopyalamak için tıkla'}
          </span>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="players-section">
          <h3>Oyuncular ({players.length}/10)</h3>
          <div className="players-list">
            {players.map((player, index) => (
              <div key={index} className={`player-card ${player.isHost ? 'host' : ''}`}>
                <div className="player-avatar">
                  {player.isHost ? '👑' : '👤'}
                </div>
                <span className="player-name">{player.nickname}</span>
                {player.nickname === myNickname && (
                  <span className="you-badge">Sen</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lobby-actions">
          {players.length < 2 && (
            <p className="waiting-text">En az 2 oyuncu gerekli...</p>
          )}
          <div className="button-group">
            {isHost && (
              <button
                className="btn-primary start-btn"
                onClick={handleStart}
                disabled={players.length < 2}
              >
                ⚡ Oyunu Başlat
              </button>
            )}
            <button className="btn-secondary" onClick={leaveRoom}>
              Çıkış
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
