import React, { useEffect, useState } from 'react';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';
import axios from 'axios';

const normalize = (r) => {
  const id = r.id || r.full_name || r.name || JSON.stringify(r);
  const name = r.name || r.full_name || r.title || id;
  const url = r.html_url || r.url || r.repository || r.homepage || '#';
  const stars = r.stargazers_count || r.stars || 0;
  const description = r.description || '';
  const tags = r.topics || r.tags || [];
  return { id, name, url, stars, description, tags, raw: r };
};

const ProjectList = ({ tags = [], query = '' }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const tagStyle = {
    fontSize: 12,
    color: '#666',
    border: '1px solid #e9e8e6',
    padding: '0px 8px',
    margin: '0 4px 4px 0',
    height: 28,
    lineHeight: '28px',
    display: 'inline-block'
  }

  useEffect(() => {
    setPage(1);
  }, [tags, query]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // cap page to 10
        const reqPage = Math.min(page, 10);
        if (!tags || tags.length === 0) {
          const resp = await axios.get(`${API_BASE}/api/projects`, { params: { q: query || '', per_page: pageSize, page: reqPage, all: false } });
          const data = resp.data && Array.isArray(resp.data.items) ? resp.data.items : (Array.isArray(resp.data) ? resp.data : []);
          const totalRaw = resp.data && typeof resp.data.total_count === 'number' ? resp.data.total_count : data.length;
          const total = Math.min(totalRaw, 100);
          const items = data.map(normalize);
          items.sort((a, b) => b.stars - a.stars);
          if (mounted) {
            setProjects(items);
            setTotalCount(total);
          }
          return;
        }

        const tagsParam = tags.join(',');
        const resp = await axios.get(`${API_BASE}/api/projects`, { params: { tags: tagsParam, per_page: pageSize, page: reqPage, all: false } });
        const data = resp.data && Array.isArray(resp.data.items) ? resp.data.items : (Array.isArray(resp.data) ? resp.data : []);
        const totalRaw = resp.data && typeof resp.data.total_count === 'number' ? resp.data.total_count : data.length;
        const total = Math.min(totalRaw, 100);
        const items = data.map(normalize);
        items.sort((a, b) => b.stars - a.stars);
        if (mounted) {
          setProjects(items);
          setTotalCount(total);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        if (mounted) setError(err.response && err.response.data ? (err.response.data.details || JSON.stringify(err.response.data)) : err.message || 'Error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => { mounted = false; };
  }, [tags, query, page]);

  if (loading) return <Spinner />;
  if (error) return <p style={{ color: 'crimson' }}>Error: {String(error)}</p>;
  if (!projects || projects.length === 0) return <p>No projects found.</p>;

  return (
    <div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
      {projects.map(project => (
        <li key={project.id} style={{ marginBottom: 8 }}>
          <a href={project.url} target="_blank" rel="noreferrer" style={{ marginBottom: 4, display: 'inline-block' }} >
            {project.name} ({project.stars} ⭐)
          </a>
          <div style={{ fontSize: 12, color: '#666' }}>
            {project.tags && project.tags.length > 0 && (
              project.tags.map(tag => (
                <span key={tag} style={tagStyle}>{tag}</span>
              ))
            )}
          </div>
          {project.description && (
            <div style={{ fontSize: 13, color: '#444' }}>{project.description}</div>
          )}
        </li>
      ))}
      </ul>
      <Pagination page={page} pageSize={pageSize} total={totalCount} onChange={p => setPage(p)} />
    </div>
  );
};

  // Simple CSS spinner
  function Spinner({ size = 40 }) {
    const style = {
      width: size,
      height: size,
      border: `${Math.max(3, Math.floor(size / 8))}px solid #e6e6e6`,
      borderTopColor: '#3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '12px auto',
      display: 'block'
    };
    return (
      <div>
        <div style={style} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

function Pagination({ page, pageSize, total, onChange }) {
  const totalPages = Math.max(1, Math.min(10, Math.ceil(total / pageSize)));
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
      <button onClick={() => onChange(1)} disabled={page === 1}>First</button>
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}>Prev</button>
      {start > 1 && <span>...</span>}
      {pages.map(p => (
        <button key={p} onClick={() => onChange(p)} style={{ fontWeight: p === page ? 'bold' : 'normal' }}>{p}</button>
      ))}
      {end < totalPages && <span>...</span>}
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Next</button>
      <button onClick={() => onChange(totalPages)} disabled={page === totalPages}>Last</button>
      <span style={{ marginLeft: 8 }}>Page {page} / {totalPages} · {total} projects</span>
    </div>
  );
}

export default ProjectList;