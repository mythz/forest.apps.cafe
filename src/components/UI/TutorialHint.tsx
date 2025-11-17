import React from 'react';

interface TutorialHintProps {
  hint: string;
  onDismiss: () => void;
}

export const TutorialHint: React.FC<TutorialHintProps> = ({ hint, onDismiss }) => {
  return (
    <div className="tutorial-hint">
      <div className="hint-icon">💡</div>
      <div className="hint-text">{hint}</div>
      <button className="hint-dismiss" onClick={onDismiss}>×</button>
    </div>
  );
};
