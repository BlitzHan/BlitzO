import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import './Scoreboard.css';

function Scoreboard() {
  const navigate = useNavigate();
  const { gameResult, scores, startNewRound, leaveRoom, myNickname } = useSocket();

  if (!gameResult) {
    return (
      <div className="scoreboard-container">
        <div className="scoreboard-content">
          <p>Sonuç bulunamadı</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Ana Menü</button>
        </div>
      </div>
    );
  }

  const sortedScores = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([nickname, score], index) => ({
      nickname,
      score,
      rank: index + 1,
      isWinner: nickname === gameResult.winner,
      isMe: nickname === myNickname,
    }));

  const rankEmojis = ['🏆', '🥈', '🥉'];

  return (
    <div className="scoreboard-container">
      <div className="confetti-container">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="confetti" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }} />
        ))}
      </div>

      <div className="scoreboard-content">
        <div className="winner-section">
          <div className="winner-crown">👑</div>
          <h2 className="winner-name blitzo-title">{gameResult.winner}</h2>
          <p className="winner-subtitle">Kazandı!</p>
          <div className="round-points">
            <span className="points-label">El Puanı</span>
            <span className="points-value">+{gameResult.roundPoints}</span>
          </div>
        </div>

        <div className="scoreboard-table">
          <h3>Genel Sıralama</h3>
          <div className="score-list">
            {sortedScores.map((entry) => (
              <div
                key={entry.nickname}
                className={`score-row ${entry.isWinner ? 'winner-row' : ''} ${entry.isMe ? 'my-row' : ''}`}
              >
                <div className="score-rank">
                  {entry.rank <= 3 ? rankEmojis[entry.rank - 1] : `#${entry.rank}`}
                </div>
                <div className="score-nickname">
                  {entry.nickname}
                  {entry.isMe && <span className="me-badge">Sen</span>}
                  {entry.isWinner && <span className="winner-badge">⚡</span>}
                </div>
                <div className="score-value">{entry.score}</div>
              </div>
            ))}
          </div>
        </div>

        {gameResult.cardDetails && Object.keys(gameResult.cardDetails).length > 0 && (
          <div className="card-breakdown">
            <h3>Kart Detayları</h3>
            {Object.entries(gameResult.cardDetails).map(([nickname, data]) => (
              <div key={nickname} className="player-breakdown">
                <div className="player-breakdown-header">
                  <span>{nickname}</span>
                  <span>{data.cardCount} kart → {data.points} puan</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="scoreboard-actions">
          <button className="btn-primary" onClick={startNewRound}>
            🔄 Yeni El
          </button>
          <button className="btn-secondary" onClick={leaveRoom}>
            🏠 Ana Menü
          </button>
        </div>
      </div>
    </div>
  );
}

export default Scoreboard;
