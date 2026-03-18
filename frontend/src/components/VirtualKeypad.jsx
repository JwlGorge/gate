import React from 'react';
import { Delete } from 'lucide-react';

const VirtualKeypad = ({ onInput, onDelete, onClear }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '-'];

  return (
    <div className="keypad-container" style={{ marginTop: '1rem' }}>
      <div className="keypad" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', maxWidth: '300px' }}>
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            className="key"
            style={{ 
              aspectRatio: '1', 
              fontSize: '1.1rem', 
              fontWeight: '600', 
              background: '#ffffff', 
              border: '1px solid var(--border)',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onClick={() => onInput(key)}
            onMouseOver={(e) => { e.target.style.background = '#f5f5f5'; e.target.style.borderColor = 'var(--primary)'; }}
            onMouseOut={(e) => { e.target.style.background = '#ffffff'; e.target.style.borderColor = 'var(--border)'; }}
          >
            {key}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', maxWidth: '300px' }}>
        <button 
          type="button" 
          className="secondary" 
          style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
          onClick={onDelete}
        >
          <Delete size={16} />
        </button>
        <button 
          type="button" 
          className="secondary" 
          style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          onClick={onClear}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default VirtualKeypad;
