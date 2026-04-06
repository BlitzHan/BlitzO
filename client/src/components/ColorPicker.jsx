import './ColorPicker.css';

function ColorPicker({ onColorPick }) {
  const colors = [
    { name: 'red', label: 'Kırmızı', emoji: '🔴' },
    { name: 'blue', label: 'Mavi', emoji: '🔵' },
    { name: 'green', label: 'Yeşil', emoji: '🟢' },
    { name: 'yellow', label: 'Sarı', emoji: '🟡' },
  ];

  return (
    <div className="color-picker-overlay">
      <div className="color-picker">
        <h3>Renk Seç</h3>
        <div className="color-options">
          {colors.map(color => (
            <button
              key={color.name}
              className={`color-option ${color.name}`}
              onClick={() => onColorPick(color.name)}
            >
              <span className="color-emoji">{color.emoji}</span>
              <span className="color-label">{color.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ColorPicker;
