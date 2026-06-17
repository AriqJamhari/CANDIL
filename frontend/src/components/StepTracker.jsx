import React from 'react';
import { Clock, Play, CheckCircle2, XCircle } from 'lucide-react';

const StepTracker = ({ status }) => {
  const steps = [
    { label: 'Pending', icon: Clock, key: 'pending', color: 'var(--accent-purple)' },
    { label: 'Proses', icon: Play, key: 'proses', color: 'var(--accent-purple)' },
    { label: 'Selesai', icon: CheckCircle2, key: 'selesai', color: 'var(--accent-teal)' }
  ];

  // If status is dibatalkan, replace the last step with Dibatalkan
  const isCancelled = status === 'dibatalkan';
  if (isCancelled) {
    steps[2] = { label: 'Dibatalkan', icon: XCircle, key: 'dibatalkan', color: 'var(--accent-red)' };
  }

  const getStepIndex = (stat) => {
    if (stat === 'pending') return 0;
    if (stat === 'proses') return 1;
    if (stat === 'selesai' || stat === 'dibatalkan') return 2;
    return -1;
  };

  const currentIndex = getStepIndex(status);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px',
      margin: '20px 0',
      position: 'relative'
    }} className="glass-panel">
      {/* Background connecting line */}
      <div style={{
        position: 'absolute',
        left: '10%',
        right: '10%',
        top: '50%',
        height: '4px',
        backgroundColor: 'var(--bg-tertiary)',
        transform: 'translateY(-50%)',
        zIndex: 1
      }}>
        {/* Active line */}
        <div style={{
          height: '100%',
          width: `${currentIndex === 0 ? 0 : currentIndex === 1 ? 50 : 100}%`,
          background: isCancelled 
            ? 'linear-gradient(90deg, var(--accent-purple) 0%, var(--accent-red) 100%)'
            : 'linear-gradient(90deg, var(--accent-purple) 0%, var(--accent-teal) 100%)',
          transition: 'width 0.5s ease-in-out'
        }} />
      </div>

      {/* Steps */}
      {steps.map((step, idx) => {
        const StepIcon = step.icon;
        const isActive = idx <= currentIndex;
        const isCurrent = idx === currentIndex;
        
        let nodeColor = 'var(--text-muted)';
        let borderStyle = '1px solid var(--border-glass)';
        let shadowStyle = 'none';

        if (isActive) {
          nodeColor = step.key === 'dibatalkan' ? 'var(--accent-red)' : idx === 2 ? 'var(--accent-teal)' : 'var(--accent-purple)';
          borderStyle = `2px solid ${nodeColor}`;
          shadowStyle = step.key === 'dibatalkan' 
            ? '0 0 15px rgba(239, 68, 68, 0.4)' 
            : idx === 2 ? '0 0 15px rgba(20, 184, 166, 0.4)' : '0 0 15px rgba(139, 92, 246, 0.4)';
        }

        return (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 2,
            width: '80px',
            gap: '8px'
          }}>
            {/* Circle Node */}
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: isCurrent ? 'var(--bg-primary)' : isActive ? nodeColor : 'var(--bg-secondary)',
              color: isActive ? (isCurrent ? nodeColor : '#0a071b') : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: borderStyle,
              boxShadow: shadowStyle,
              transition: 'all 0.5s ease',
              transform: isCurrent ? 'scale(1.15)' : 'scale(1)'
            }}>
              <StepIcon size={20} />
            </div>

            {/* Label */}
            <span style={{
              fontSize: '0.8rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              textAlign: 'center',
              textTransform: 'capitalize'
            }}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StepTracker;
