import { useState, useEffect } from "react";

// small fade/scale on mount
const PageTransition = ({ children }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? 'scale(1)' : 'scale(0.98)',
      filter: show ? 'blur(0)' : 'blur(5px)',
      transition: 'opacity 450ms cubic-bezier(0.4, 0, 0.2, 1), transform 450ms cubic-bezier(0.4, 0, 0.2, 1), filter 450ms cubic-bezier(0.4, 0, 0.2, 1)',
      width: '100%'
    }}>
      {children}
    </div>
  );
};

export default PageTransition;