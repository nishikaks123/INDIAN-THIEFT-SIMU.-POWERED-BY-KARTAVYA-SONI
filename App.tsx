import React, { useState, useCallback } from 'react';
import Game from './Game';

const App: React.FC = () => {
  const [resources, setResources] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState('Day');
  const [health, setHealth] = useState(100);

  const handleResourceCollected = useCallback(() => {
    setResources(prev => prev + 1);
  }, []);

  const handleTimeUpdate = useCallback((newTime: string) => {
    setTimeOfDay(newTime);
  }, []);
  
  const handleHealthUpdate = useCallback((newHealth: number) => {
    setHealth(newHealth);
  }, []);

  return (
    <div className="relative w-screen h-screen">
      <Game 
        onResourceCollected={handleResourceCollected}
        onTimeUpdate={handleTimeUpdate}
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
            <p className="text-gray-300 text-sm">Time: <span className="font-semibold text-yellow-300">{timeOfDay}</span></p>
            <p className="text-gray-300 text-sm">Wood: <span className="font-semibold text-green-400">{resources}</span></p>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
        <div className="p-2 bg-black bg-opacity-50 rounded-lg text-sm mb-2">
            <p>E - Collect | R - Toggle Rain | Space - Jump</p>
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