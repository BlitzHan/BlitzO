import './Card.css';

function Card({ card, compact = false }) {
  const getDisplay = () => {
    if (card.type === 'number') return String(card.value);
    if (card.value === 'skip') return '🚫';
    if (card.value === 'reverse') return '🔄';
    if (card.value === 'draw2') return '+2';
    if (card.value === 'wild') return '⚡';
    if (card.value === 'wild4') return '+4';
    return '';
  };

  const getLabel = () => {
    if (card.type === 'number') return '';
    if (card.value === 'skip') return 'SKIP';
    if (card.value === 'reverse') return 'REV';
    if (card.value === 'draw2') return '+2';
    if (card.value === 'wild') return 'WILD';
    if (card.value === 'wild4') return '+4';
    return '';
  };

  const getCardClass = () => {
    const base = 'uno-card';
    if (card.type === 'wild') return `${base} wild`;
    return `${base} ${card.color}`;
  };

  const display = getDisplay();
  const label = getLabel();
  const isSpecial = card.type === 'special' || card.type === 'wild';

  return (
    <div className={getCardClass()}>
      <div className="card-border">
        <div className="card-face">
          <span className="card-value top">{display}</span>
          <div className="card-center-content">
            {isSpecial ? (
              <>
                <span className="card-icon">{display}</span>
                {label && <span className="card-label">{label}</span>}
              </>
            ) : (
              <span className="card-main-value">{display}</span>
            )}
          </div>
          <span className="card-value bottom">{display}</span>
          <div className="card-lightning" />
        </div>
      </div>
    </div>
  );
}

export default Card;
