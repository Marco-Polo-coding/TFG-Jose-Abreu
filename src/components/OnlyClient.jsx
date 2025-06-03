import { useEffect, useState } from 'react';

const OnlyClient = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return children;
};

export default OnlyClient; 