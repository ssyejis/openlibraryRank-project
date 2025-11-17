import React, { useState } from 'react';
import axios from 'axios';
import ProjectList from './components/ProjectList';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function App() {
  const [tags, setTags] = useState([]);
  const [query, setQuery] = useState('');

  const addTag = (tag) => {
    const t = tag.trim();
    if (!t) return;
    if (tags.includes(t)) return;
    setTags(prev => [...prev, t]);
  };

  const removeTag = (tag) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>오픈라이브러리 rank</h1>
      <div style={{ marginBottom: 12 }}>
        <TagInput onAdd={addTag} onSearch={setQuery} />
        <div style={{ marginTop: 8 }}>
          {tags.map(tag => (
            <Tag key={tag} tag={tag} onRemove={() => removeTag(tag)} />
          ))}
        </div>
      </div>
      <ProjectList tags={tags} query={query} />
    </div>
  );
}

function TagInput({ onAdd, onSearch }) {
  const [value, setValue] = useState('');
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    setChecking(true);
    setMessage('');
    axios.get(`${API_BASE}/api/projects`, { params: { q: v, per_page: 1, all: false } })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.items || res.data.projects || []);
        if (data && data.length > 0) {
          if (onSearch) onSearch(v);
          onAdd(v);
          setValue('');
        } else {
          setMessage('GitHub에서 해당 키워드로 결과를 찾을 수 없습니다.');
        }
      })
      .catch(err => {
        console.error(err);
        if (err && err.response && err.response.status === 403) {
          setMessage('GitHub API rate limit에 도달했습니다. GITHUB_TOKEN을 설정하면 제한이 상향됩니다.');
        } else {
          setMessage('검색 중 오류가 발생했습니다. 콘솔을 확인하세요.');
        }
      })
      .finally(() => setChecking(false));
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
      <input
        placeholder="검색어 입력"
        value={value}
        onChange={e => setValue(e.target.value)}
        style={{ padding: 8, flex: 1 }}
      />
      <button type="submit">추가</button>
      <div style={{ marginLeft: 8, alignSelf: 'center' }}>{checking ? <SmallSpinner size={16} /> : null}</div>
      {message && <div style={{ color: 'crimson', marginTop: 6 }}>{message}</div>}
    </form>
  );
}

function SmallSpinner({ size = 12 }) {
  const style = {
    width: size,
    height: size,
    border: '2px solid #e6e6e6',
    borderTopColor: '#3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    display: 'inline-block'
  };
  return (
    <span>
      <span style={style} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

function Tag({ tag, onRemove }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 8px', marginRight: 8, background: '#eee', borderRadius: 16 }}>
      <strong style={{ marginRight: 8 }}>{tag}</strong>
      <button onClick={onRemove} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
    </span>
  );
}

export default App;