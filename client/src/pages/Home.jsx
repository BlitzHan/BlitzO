import { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import './Home.css';

function Home() {
  const { createRoom, joinRoom, error } = useSocket();
  const [mode, setMode] = useState('create');
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinNickname, setJoinNickname] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!roomName.trim() || !nickname.trim()) return;
    createRoom(roomName.trim(), password, nickname.trim());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomCode.trim() || !joinNickname.trim()) return;
    joinRoom(roomCode.trim(), joinPassword, joinNickname.trim());
  };

  return (
    <div className="home-container">
      <div className="lightning-bg" />
      <div className="home-content">
        <div className="logo-section">
          <h1 className="blitzo-title">⚡ BlitzO! ⚡</h1>
          <p className="subtitle">Online Uno Oyunu</p>
        </div>

        <div className="forms-container">
          <div className="mode-toggle">
            <button
              className={mode === 'create' ? 'active' : ''}
              onClick={() => setMode('create')}
            >
              Oda Oluştur
            </button>
            <button
              className={mode === 'join' ? 'active' : ''}
              onClick={() => setMode('join')}
            >
              Odaya Katıl
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {mode === 'create' ? (
            <form className="game-form" onSubmit={handleCreate}>
              <div className="form-group">
                <label>Oda Adı</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Eğlenceli bir oda adı..."
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  maxLength={30}
                />
              </div>
              <div className="form-group">
                <label>Şifre (opsiyonel)</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Oda şifresi..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={20}
                />
              </div>
              <div className="form-group">
                <label>Nick</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Kullanıcı adın..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={15}
                />
              </div>
              <button type="submit" className="btn-primary">
                ⚡ Oda Oluştur
              </button>
            </form>
          ) : (
            <form className="game-form" onSubmit={handleJoin}>
              <div className="form-group">
                <label>Oda Kodu</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="6 haneli oda kodu..."
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
              <div className="form-group">
                <label>Şifre</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Oda şifresi..."
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  maxLength={20}
                />
              </div>
              <div className="form-group">
                <label>Nick</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Kullanıcı adın..."
                  value={joinNickname}
                  onChange={(e) => setJoinNickname(e.target.value)}
                  maxLength={15}
                />
              </div>
              <button type="submit" className="btn-primary">
                ⚡ Odaya Katıl
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
