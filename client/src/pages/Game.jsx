import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import Card from '../components/Card';
import ColorPicker from '../components/ColorPicker';
import './Game.css';

function Game() {
  const { roomCode } = useParams();
  const {
    myHand,
    topCard,
    activeColor,
    currentPlayerSocket,
    direction,
    players,
    scores,
    round,
    myNickname,
    gameStatus,
    canPlayDrawnCard,
    unoCalled,
    pendingUnoPenalty,
    drawAnimation,
    playCard,
    drawCard,
    callUno,
    penalizeUno,
    leaveRoom,
    requestColorPick,
    showColorPicker,
    handleColorPick,
  } = useSocket();

  const [hoveredCard, setHoveredCard] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const sortedHand = useMemo(() => {
    const colorOrder = { red: 0, blue: 1, green: 2, yellow: 3, wild: 4 };
    const typeOrder = { number: 0, special: 1, wild: 2 };
    return [...myHand].sort((a, b) => {
      if (a.color !== b.color) return colorOrder[a.color] - colorOrder[b.color];
      if (a.type !== b.type) return typeOrder[a.type] - typeOrder[b.type];
      if (a.type === 'number') return a.value - b.value;
      if (a.type === 'special') {
        const specialOrder = { skip: 0, reverse: 1, draw2: 2 };
        return (specialOrder[a.value] || 0) - (specialOrder[b.value] || 0);
      }
      const wildOrder = { wild: 0, wild4: 1 };
      return (wildOrder[a.value] || 0) - (wildOrder[b.value] || 0);
    });
  }, [myHand]);

  const isMyTurn = currentPlayerSocket === useSocket().socket?.id;
  const myPlayer = players.find(p => p.nickname === myNickname);
  const otherPlayers = players.filter(p => p.nickname !== myNickname);

  const canPlayCard = useMemo(() => {
    if (!isMyTurn || !topCard || gameStatus !== 'playing') return {};
    const playable = {};
    myHand.forEach(card => {
      if (card.type === 'wild') {
        playable[card.id] = true;
      } else if (card.color === activeColor) {
        playable[card.id] = true;
      } else if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) {
        playable[card.id] = true;
      } else if (card.type === 'special' && topCard.type === 'special' && card.value === topCard.value) {
        playable[card.id] = true;
      } else if (card.type === 'number' && topCard.type === 'special' && String(card.value) === String(topCard.value)) {
        playable[card.id] = true;
      } else if (card.type === 'special' && topCard.type === 'number' && String(card.value) === String(topCard.value)) {
        playable[card.id] = true;
      }
    });
    return playable;
  }, [myHand, isMyTurn, topCard, activeColor, gameStatus]);

  const handleDraw = () => {
    if (!isMyTurn || gameStatus !== 'playing' || isDrawing) return;
    setIsDrawing(true);
    drawCard();
    setTimeout(() => setIsDrawing(false), 800);
  };

  const handleCardClick = (card) => {
    if (!isMyTurn || gameStatus !== 'playing') return;
    if (!canPlayCard[card.id]) return;

    if (card.type === 'wild') {
      requestColorPick(card);
    } else {
      playCard(card.id);
    }
  };

  const handleUno = () => {
    if (myHand.length <= 2) {
      callUno();
    }
  };

  const getCardDisplay = (card) => {
    if (card.type === 'number') return card.value;
    if (card.value === 'skip') return '⊘';
    if (card.value === 'reverse') return '⟲';
    if (card.value === 'draw2') return '+2';
    if (card.value === 'wild') return '⚡';
    if (card.value === 'wild4') return '+4';
    return '';
  };

  const getColorName = (color) => {
    const names = { red: 'Kırmızı', blue: 'Mavi', green: 'Yeşil', yellow: 'Sarı' };
    return names[color] || color;
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="header-left">
          <span className="blitzo-title" style={{ fontSize: '20px' }}>⚡ BlitzO!</span>
          <span className="round-badge">El {round}</span>
        </div>
        <div className="header-center">
          <div className="direction-indicator">
            <span className={`direction-arrow ${direction === 1 ? 'cw' : 'ccw'}`}>
              {direction === 1 ? '→' : '←'}
            </span>
          </div>
          <div className={`active-color ${activeColor}`} title={getColorName(activeColor)}>
            <span className="color-dot" />
          </div>
          <div className="turn-display">
            <span className="turn-icon">⚡</span>
            <span className="turn-label">SIRA:</span>
            <span className="turn-name">{players.find(p => p.socketId === currentPlayerSocket)?.nickname || '...'}</span>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-leave" onClick={leaveRoom}>Çıkış</button>
        </div>
      </div>

      {unoCalled && (
        <div className="uno-announcement">
          <span>UNO!</span>
        </div>
      )}

      <div className="opponents-area">
        <div className="opponents-grid">
          {otherPlayers.map((player, index) => {
            const isCurrentPlayer = player.nickname === players.find(p => p.socketId === currentPlayerSocket)?.nickname;
            return (
              <div
                key={player.nickname}
                className={`opponent-card ${isCurrentPlayer ? 'active-turn' : ''}`}
              >
                <div className="opponent-avatar">
                  {player.isHost ? '👑' : '👤'}
                </div>
                <span className="opponent-name">{player.nickname}</span>
                {isCurrentPlayer && <span className="now-playing-badge">Şimdi Oynuyor</span>}
                <div className="opponent-hand">
                  {Array.from({ length: Math.min(player.handCount, 10) }).map((_, i) => (
                    <div key={i} className="mini-card" />
                  ))}
                  {player.handCount > 10 && <span className="more-cards">+{player.handCount - 10}</span>}
                </div>
                <span className="card-count">{player.handCount} kart</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="play-area">
        <div className={`draw-pile ${isDrawing || drawAnimation ? 'drawing' : ''}`} onClick={handleDraw}>
          <div className="card-back">
            <div className="card-back-design">
              <span className="lightning-icon">⚡</span>
              <span className="card-back-text">BlitzO!</span>
            </div>
          </div>
          <span className="draw-label">Çek</span>
          {(isDrawing || drawAnimation) && <div className="draw-effect" />}
        </div>

        <div className="discard-pile">
          {topCard ? (
            <div className={`played-card ${topCard.color} ${topCard.type === 'wild' ? 'wild' : ''}`}>
              <div className="played-card-inner">
                <span className="card-corner top-left">
                  {getCardDisplay(topCard)}
                </span>
                <span className="card-center">
                  {getCardDisplay(topCard)}
                  {topCard.type === 'wild' && <span className="wild-lightning">⚡</span>}
                </span>
                <span className="card-corner bottom-right">
                  {getCardDisplay(topCard)}
                </span>
              </div>
            </div>
          ) : (
            <div className="empty-discard">Bekleniyor...</div>
          )}
        </div>

        {canPlayDrawnCard && (
          <div className="drawn-card-notice">
            Çektiğin kartı oynayabilirsin!
          </div>
        )}
      </div>

      <div className="hand-area">
        <div className={`turn-indicator ${isMyTurn ? 'your-turn' : 'not-your-turn'}`}>
          {isMyTurn ? '⚡ Sıra Sende!' : `${players.find(p => p.socketId === currentPlayerSocket)?.nickname || '...'} oynuyor...`}
        </div>

        <div className="hand-scroll">
          {(() => {
            const half = Math.ceil(sortedHand.length / 2);
            const row1 = sortedHand.slice(0, half);
            const row2 = sortedHand.slice(half);
            return (
              <>
                <div className="hand-row">
                  {row1.map((card) => (
                    <div
                      key={card.id}
                      className={`hand-card-wrapper ${canPlayCard[card.id] ? 'playable' : ''} ${hoveredCard === card.id ? 'hovered' : ''}`}
                      onClick={() => handleCardClick(card)}
                      onMouseEnter={() => setHoveredCard(card.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <Card card={card} compact />
                    </div>
                  ))}
                </div>
                {row2.length > 0 && (
                  <div className="hand-row">
                    {row2.map((card) => (
                      <div
                        key={card.id}
                        className={`hand-card-wrapper ${canPlayCard[card.id] ? 'playable' : ''} ${hoveredCard === card.id ? 'hovered' : ''}`}
                        onClick={() => handleCardClick(card)}
                        onMouseEnter={() => setHoveredCard(card.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <Card card={card} compact />
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {myHand.length === 2 && (
          <button
            className={`uno-btn ${isMyTurn ? 'visible' : ''}`}
            onClick={handleUno}
          >
            UNO!
          </button>
        )}
      </div>

      {showColorPicker && (
        <ColorPicker onColorPick={handleColorPick} />
      )}

      {pendingUnoPenalty && isMyTurn && (
        <div className="penalty-fixed">
          <span className="penalty-label">⚠️ {pendingUnoPenalty.targetNickname} UNO demedi!</span>
          <button className="penalty-fixed-btn" onClick={penalizeUno}>CEZA VER</button>
        </div>
      )}
    </div>
  );
}

export default Game;
