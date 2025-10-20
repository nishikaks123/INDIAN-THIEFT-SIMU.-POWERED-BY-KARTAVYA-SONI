import React, { useState, useCallback, useEffect, useRef } from 'react';
import Game, { Location } from './Game';

// --- Minimap Component ---
interface MinimapProps {
  playerPosition: { x: number; z: number; rotationY: number };
  locations: Location[];
}

const Minimap: React.FC<MinimapProps> = ({ playerPosition, locations }) => {
  const mapScale = 1.5; // How "zoomed-in" the map is

  // Calculate the offset for the map so the player icon stays in the center
  const mapOffsetX = -playerPosition.x * mapScale;
  const mapOffsetZ = -playerPosition.z * mapScale;

  return (
    <div className="absolute bottom-4 left-4 w-48 h-48 bg-gray-900/60 backdrop-blur-sm border-2 border-cyan-400/50 rounded-full overflow-hidden shadow-2xl pointer-events-none">
      {/* Map Content Container */}
      <div 
        className="absolute w-full h-full transition-transform duration-100 ease-linear"
        style={{ transform: `translate(${mapOffsetX}px, ${mapOffsetZ}px)` }}
      >
        {/* Location Icons */}
        {locations.map(loc => (
          <div 
            key={loc.name}
            className="absolute text-cyan-300 text-xs font-bold"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(${loc.position.x * mapScale - 4}px, ${loc.position.z * mapScale - 4}px)`
            }}
            title={loc.name}
          >
            {loc.icon}
          </div>
        ))}
      </div>
      
      {/* Player Icon (always in the center) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
         <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-5 h-5 transition-transform"
            style={{ transform: `rotate(${playerPosition.rotationY}rad)` }}
        >
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
        </svg>
      </div>
    </div>
  );
};


// --- Main App Component ---
const App: React.FC = () => {
  const [resources, setResources] = useState(0);
  const [health, setHealth] = useState(100);
  const [isHit, setIsHit] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, z: 0, rotationY: 0 });
  const [locations, setLocations] = useState<Location[]>([]);
  const prevHealthRef = useRef(health);

  const handleResourceCollected = useCallback(() => {
    setResources(prev => prev + 1);
  }, []);
  
  const handleHealthUpdate = useCallback((newHealth: number) => {
    setHealth(newHealth);
  }, []);
  
  const handlePlayerMove = useCallback((pos: { x: number; z: number; rotationY: number }) => {
    setPlayerPosition(pos);
  }, []);

  const handleLocationsLoaded = useCallback((loadedLocations: Location[]) => {
    setLocations(loadedLocations);
  }, []);


  useEffect(() => {
    if (health < prevHealthRef.current) {
      setIsHit(true);
      const timer = setTimeout(() => setIsHit(false), 200);
      return () => clearTimeout(timer);
    }
    prevHealthRef.current = health;
  }, [health]);

  return (
    <div className={`relative w-screen h-screen transition-all duration-100 ${isHit ? 'shadow-[inset_0_0_0_8px_rgba(255,0,0,0.5)] shadow-red-500/50' : ''}`}>
      <Game 
        onResourceCollected={handleResourceCollected}
        onHealthUpdate={handleHealthUpdate}
        onPlayerMove={handlePlayerMove}
        onLocationsLoaded={handleLocationsLoaded}
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
            <p className="text-gray-300 text-sm">Time: <span className="font-semibold text-yellow-300">Day</span></p>
            <p className="text-gray-300 text-sm">Wood: <span className="font-semibold text-green-400">{resources}</span></p>
        </div>
      </div>

      <Minimap playerPosition={playerPosition} locations={locations} />

      <div className="absolute bottom-4 right-4 flex flex-col items-end pointer-events-none">
        <div className="p-2 bg-black bg-opacity-50 rounded-lg text-sm mb-2">
            <p>F - Attack | E - Collect | V - Change View | Space - Jump</p>
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