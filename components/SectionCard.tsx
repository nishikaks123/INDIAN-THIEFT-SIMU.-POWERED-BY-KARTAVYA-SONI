
import React from 'react';

interface SectionCardProps {
  title: string;
  content: string;
  icon: React.ReactNode;
}

// Helper component to render content with nested bullets
const ContentRenderer: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');

    const createList = (lines: string[], level: number): React.ReactNode[] => {
        const items = [];
        let i = 0;
        while (i < lines.length) {
            const line = lines[i];
            const currentIndent = line.match(/^\s*/)?.[0].length ?? 0;
            
            if (currentIndent < level) {
                break;
            }

            if (line.trim().startsWith('*')) {
                const sublistLines = [];
                let j = i + 1;
                while (j < lines.length) {
                    const nextLine = lines[j];
                    const nextIndent = nextLine.match(/^\s*/)?.[0].length ?? 0;
                    if (nextIndent > currentIndent) {
                        sublistLines.push(nextLine);
                    } else {
                        break;
                    }
                    j++;
                }

                items.push(
                    <li key={i} className="mb-2 last:mb-0">
                        <span className="text-gray-300">{line.trim().substring(1).trim()}</span>
                        {sublistLines.length > 0 && 
                            <ul className="list-disc list-inside mt-2 ml-4 text-gray-400">
                                {/* FIX: Replaced 'next-level' typo with 'currentIndent + 1' to correctly handle nested list indentation. */}
                                {createList(sublistLines, currentIndent + 1)}
                            </ul>
                        }
                    </li>
                );
                i = j;
            } else {
                i++;
            }
        }
        return items;
    };

    return (
        <ul className="list-disc list-inside text-gray-400 space-y-2">
            {createList(lines, 0)}
        </ul>
    );
};


export const SectionCard: React.FC<SectionCardProps> = ({ title, content, icon }) => {
  return (
    <div className="bg-gray-800/60 backdrop-blur-sm border border-blue-500/20 rounded-2xl shadow-2xl p-6 flex flex-col transition-all duration-300 hover:border-blue-400/50 hover:shadow-blue-500/10 hover:-translate-y-1">
      <div className="flex items-center mb-4">
        <div className="text-blue-400 mr-4">{icon}</div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <div className="text-sm text-gray-300 space-y-2 leading-relaxed h-full overflow-y-auto max-h-96 pr-2">
         <ContentRenderer content={content} />
      </div>
    </div>
  );
};
