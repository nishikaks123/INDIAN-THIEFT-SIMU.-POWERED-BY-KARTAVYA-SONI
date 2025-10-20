import React, { useState, useCallback, useEffect, useRef } from 'react';
import Game from './Game';

const App: React.FC = () => {
  const [resources, setResources] = useState(0);
  const [health, setHealth] = useState(100);
  const [isHit, setIsHit] = useState(false);
  const prevHealthRef = useRef(health);

  const handleResourceCollected = useCallback(() => {
    setResources(prev => prev + 1);
  }, []);
  
  const handleHealthUpdate = useCallback((newHealth: number) => {
    setHealth(newHealth);
  }, []);

  useEffect(() => {
    if (health < prevHealthRef.current) {
      setIsHit(true);
      const timer = setTimeout(() => setIsHit(false), 200); // Flash for 200ms
      return () => clearTimeout(timer);
    }
    prevHealthRef.current = health;
  }, [health]);

  return (
    <div className={`relative w-screen h-screen transition-all duration-100 ${isHit ? 'shadow-[inset_0_0_0_8px_rgba(255,0,0,0.5)] shadow-red-500/50' : ''}`}>
      <Game 
        onResourceCollected={handleResourceCollected}
        onHealthUpdate={handleHealthUpdate}
      />
      <div className="absolute top-0 left-0 p-4 bg-black bg-opacity-50 rounded-br-lg pointer-events-none text-white w-52">
        <h1 className="text-xl font-bold">3D World Prototype</h1>
        <div className="mt-3 space-y-2">
            <div>
                <p className="text-gray-300 text-sm">Health</p>
                <div className="w-full bg-red-900 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full transition-all duration-300" style={{width: `${health}%`}}></div>
                </div>
            </div>
            <p className="text-gray-300 text-sm">Time: <span className="font-semibold text-cyan-300">Night</span></p>
            <p className="text-gray-300 text-sm">Wood: <span className="font-semibold text-green-400">{resources}</span></p>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
        <div className="p-2 bg-black bg-opacity-50 rounded-lg text-sm mb-2">
            <p>F - Attack | E - Collect | R - Toggle Rain | Space - Jump</p>
        </div>
        <div className="flex space-x-2 p-2 bg-black bg-opacity-50 rounded-lg">
          <div className="w-10 h-10 border-2 border-gray-400 rounded flex items-center justify-center font-bold">W</div>
          <div className="w-10 h-10 border-2 border-gray-400 rounded flex items-center justify-center font-bold">A</div>
          <div className="w-10 h-10 border-2 border-gray-400 rounded flex items-center justify-center font-bold">S</div>
          <div className="w-10 h-10 border-2 border-gray-400 rounded flex items-center justify-center font-bold">D</div>
        </div>
      </div>
    </div>
  );
};

export default App;