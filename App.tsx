import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { SectionCard } from './components/SectionCard';
import { getIconForTitle } from './components/IconComponents';
import { generateGdd } from './services/geminiService';
import { initialPrompt } from './constants';

interface GddSection {
  title: string;
  content: string;
}

const App: React.FC = () => {
  const [userInput, setUserInput] = useState(initialPrompt);
  const [gddSections, setGddSections] = useState<GddSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseGddContent = (content: string): GddSection[] => {
    // Split by markdown H2 headings (##) that start on a new line
    const sections = content.split(/\n(?=##\s)/).filter(s => s.trim().startsWith('##'));
    return sections.map(sectionText => {
      const lines = sectionText.trim().split('\n');
      const title = lines[0].replace(/##\s*/, '').trim();
      const content = lines.slice(1).join('\n');
      return { title, content };
    });
  };

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGddSections([]);
    try {
      const result = await generateGdd(userInput);
      const parsedSections = parseGddContent(result);
      if (parsedSections.length === 0 && result) {
         // Fallback for when splitting fails but content exists
         setGddSections([{ title: "Generated Document", content: result }]);
      } else {
         setGddSections(parsedSections);
      }
    } catch (err) {
      setError('Failed to generate the Game Design Document. Please check the console for more details.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userInput]);

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Input */}
        <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl shadow-xl p-6 lg:sticky lg:top-28">
          <h2 className="text-xl font-bold text-white mb-4">Game Concept</h2>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full h-96 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-y"
            placeholder="Enter your game concept here..."
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center shadow-lg"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              '✨ Generate GDD'
            )}
          </button>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-4 rounded-lg">
              <h3 className="font-bold">An Error Occurred</h3>
              <p>{error}</p>
            </div>
          )}
          {!isLoading && gddSections.length === 0 && !error && (
            <div className="text-center py-20 bg-gray-800/50 backdrop-blur-sm border border-blue-500/10 rounded-2xl">
              <h2 className="text-2xl font-bold text-white">Welcome to GDD.ai</h2>
              <p className="text-gray-400 mt-2">Enter your game concept on the left and click "Generate GDD" to bring your vision to life!</p>
            </div>
          )}
          {gddSections.map((section, index) => (
            <SectionCard
              key={index}
              title={section.title}
              content={section.content}
              icon={getIconForTitle(section.title)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
