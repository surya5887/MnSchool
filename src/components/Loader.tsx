import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px',
      minHeight: '200px',
      gridColumn: '1 / -1'
    }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ y: 0 }}
            animate={{ y: [-10, 0, -10] }}
            transition={{ 
              duration: 0.6, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 0.15
            }}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
            }}
          />
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          fontWeight: 500,
          margin: 0
        }}
      >
        {message}
      </motion.p>
    </div>
  );
};

export default Loader;
