import { useState, useEffect } from 'react';

const MINIMUM_LOADING_TIME = 800; // 800ms mínimo de carga

const useLoadingState = (initialLoading = true) => {
  const [loading, setLoading] = useState(initialLoading);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!loading) {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsedTime);

      if (remainingTime > 0) {
        const timer = setTimeout(() => {
          setLoading(false);
        }, remainingTime);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, startTime]);

  return [loading, setLoading];
};

export default useLoadingState; 