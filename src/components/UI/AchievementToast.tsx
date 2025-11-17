import React, { useEffect, useState } from 'react';
import { Achievement } from '../../game/systems/AchievementSystem';

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`achievement-toast ${visible ? 'visible' : ''}`}>
      <div className="achievement-header">🏆 Achievement Unlocked!</div>
      <div className="achievement-content">
        <div className="achievement-icon">{achievement.icon}</div>
        <div className="achievement-info">
          <div className="achievement-name">{achievement.name}</div>
          <div className="achievement-description">{achievement.description}</div>
        </div>
      </div>
    </div>
  );
};
