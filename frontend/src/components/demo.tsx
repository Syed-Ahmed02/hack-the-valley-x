import React from 'react';
import { GooeySearchBar } from "@/components/ui/animated-search-bar";

const DemoOne = () => {
  return (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#e5e7eb',
        padding: '20px',
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden'
    }}>
      <GooeySearchBar />
    </div>
  );
};

export default DemoOne;
