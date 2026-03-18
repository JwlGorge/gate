import React from 'react';
import { Delete } from 'lucide-react';

const VirtualKeypad = ({ onInput, onDelete, onClear }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '-'];

  return (
    <div className="keypad-container" style={{ marginTop: '1rem' }}>
      <div className="keypad">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            className="key"
            onClick={() => onInput(key)}
            onMouseOver={(e) => { e.target.style.background = '#f5f5f5'; e.target.style.borderColor = 'var(--primary)'; }}
            onMouseOut={(e) => { e.target.style.background = '#ffffff'; e.target.style.borderColor = 'var(--border)'; }}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="btn-group" style={{ marginTop: '0.75rem', maxWidth: '280px', margin: '0.75rem auto 0' }}>
        <button 
          type="button" 
          className="secondary" 
          onClick={onDelete}
        >
          <Delete size={16} />
        </button>
        <button 
          type="button" 
          className="secondary" 
          style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          onClick={onClear}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default VirtualKeypad;
