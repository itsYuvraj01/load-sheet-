// AutoLogout.jsx
import { useIdleTimer } from 'react-idle-timer';
import secureLocalStorage from 'react-secure-storage';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const AutoLogout = () => {
  const navigate = useNavigate();

  const handleOnIdle = useCallback(() => {
    const isAuthenticated = secureLocalStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
      secureLocalStorage.removeItem("isAuthenticated");
      secureLocalStorage.removeItem("UID");
      secureLocalStorage.removeItem("userId");
      secureLocalStorage.removeItem("Permissions");
      secureLocalStorage.removeItem("sessionTimeOut");
      navigate('/');
    }
  }, [navigate]);

  useIdleTimer({
    timeout: 1000 * 60 * 15, // 15 minutes
    onIdle: handleOnIdle,
    debounce: 500,
  });

  return null;
};

export default AutoLogout;
