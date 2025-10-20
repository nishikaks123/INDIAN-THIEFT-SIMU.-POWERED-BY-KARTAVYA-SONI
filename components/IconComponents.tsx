
import React from 'react';

const iconProps = {
  className: "w-8 h-8",
  strokeWidth: "1.5"
};

const WorldIcon = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const PlayerIcon = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const GameplayIcon = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-12a2.25 2.25 0 01-2.25-2.25V3M16.5 18.75h.008v.008h-.008v-.008zM12 18.75h.008v.008h-.008v-.008zM7.5 18.75h.008v.008h-.008v-.008z" />
  </svg>
);

const AiIcon = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 8.25v7.5a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const EconomyIcon = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0H21m-9 12.75h.008v.008H12v-.008zM12 15a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V15.75A.75.75 0 0112 15zm0 2.25a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0v-.008a.75.75 0 01.75-.75zm0 2.25a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0v-.008a.75.75 0 01.75-.75z" />
  </svg>
);

const OnlineIcon = () => (
    <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75c2.421 0 4.735-.901 6.46-2.522m-12.92 0A10.455 10.455 0 0112 2.25c2.421 0 4.735.901 6.46 2.522M2.25 12a10.455 10.455 0 0119.5 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75v.012m0 3.726v.012m0 3.726v.012m0 3.726v.012" />
    </svg>
);

const GraphicsIcon = () => (
    <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M.75 12.75l-1.5-1.5L12 3l12.75 8.25-1.5 1.5M3 14.25l9 5.25 9-5.25M3 14.25v-3l9 5.25v3l-9-5.25v-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 14.25v-3l-9 5.25v3l9-5.25v-3z" />
    </svg>
);

const ManagementIcon = () => (
    <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.025 1.11-1.226l.043-.018a2.25 2.25 0 012.067 0l.043.018c.55.201 1.02.684 1.11 1.226l.043.259a2.25 2.25 0 001.944 1.486l.271-.012a2.25 2.25 0 012.207 2.207l-.012.271a2.25 2.25 0 001.486 1.944l.259.043a2.25 2.25 0 010 2.067l-.043.259a2.25 2.25 0 00-1.486 1.944l.012.271a2.25 2.25 0 01-2.207 2.207l-.271-.012a2.25 2.25 0 00-1.944 1.486l-.043.259a2.25 2.25 0 01-2.067 0l-.043-.259a2.25 2.25 0 00-1.944-1.486l-.271.012a2.25 2.25 0 01-2.207-2.207l.012-.271a2.25 2.25 0 00-1.486-1.944l-.259-.043a2.25 2.25 0 010-2.067l.259-.043a2.25 2.25 0 001.486-1.944l-.012-.271a2.25 2.25 0 012.207-2.207l.271.012a2.25 2.25 0 001.944-1.486l.043-.259z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const BrowserIcon = () => (
    <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V5.25A2.25 2.25 0 0018 3H6A2.25 2.25 0 003.75 5.25v12.75A2.25 2.25 0 006 20.25z" />
    </svg>
);

const BonusIcon = () => (
    <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.5 21.75l-.398-1.188a3.375 3.375 0 00-2.923-2.923L12 17.25l1.188-.398a3.375 3.375 0 002.923-2.923L16.5 12.75l.398 1.188a3.375 3.375 0 002.923 2.923L21 17.25l-1.188.398a3.375 3.375 0 00-2.923 2.923z" />
    </svg>
);

const defaultIcon = <WorldIcon />;

export const getIconForTitle = (title: string): React.ReactNode => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('world') || lowerTitle.includes('environment')) return <WorldIcon />;
    if (lowerTitle.includes('player')) return <PlayerIcon />;
    if (lowerTitle.includes('gameplay') || lowerTitle.includes('missions')) return <GameplayIcon />;
    if (lowerTitle.includes('interaction') || lowerTitle.includes('ai')) return <AiIcon />;
    if (lowerTitle.includes('economy') || lowerTitle.includes('progress')) return <EconomyIcon />;
    if (lowerTitle.includes('online') || lowerTitle.includes('social')) return <OnlineIcon />;
    if (lowerTitle.includes('graphics') || lowerTitle.includes('audio')) return <GraphicsIcon />;
    if (lowerTitle.includes('management')) return <ManagementIcon />;
    if (lowerTitle.includes('browser')) return <BrowserIcon />;
    if (lowerTitle.includes('bonus')) return <BonusIcon />;
    return defaultIcon;
};
