import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    // אם אין הודעה, אל תעשה כלום
    if (!message) return;

    // מפעילים טיימר ל-3 שניות (3000 מילי-שניות)
    const timer = setTimeout(() => {
      onClose(); // קורא לפונקציה שמאפסת את ההודעה
    }, 3000);

    // פונקציית הניקוי: אם הקומפוננטה נעלמת לפני הזמן, אנחנו מנקים את הטיימר
    // כדי לא לגרום לזליגת זיכרון (Memory Leak)
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${type}`}>
        {message}
      </div>
    </div>
  );
};

export default Toast;