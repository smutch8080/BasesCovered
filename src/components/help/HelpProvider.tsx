import React, { createContext, useContext, useState } from 'react';
import { HelpSection } from '../../types/help';
import { HelpDrawer } from './HelpDrawer';

interface HelpContextType {
  openHelp: (section: HelpSection, articleId?: string) => void;
  closeHelp: () => void;
}

const HelpContext = createContext<HelpContextType | null>(null);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

export const HelpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<HelpSection | undefined>();
  const [currentArticleId, setCurrentArticleId] = useState<string | undefined>();

  const openHelp = (section: HelpSection, articleId?: string) => {
    setCurrentSection(section);
    setCurrentArticleId(articleId);
    setIsOpen(true);
  };

  const closeHelp = () => {
    setIsOpen(false);
  };

  return (
    <HelpContext.Provider value={{ openHelp, closeHelp }}>
      {children}
      <HelpDrawer
        isOpen={isOpen}
        onClose={closeHelp}
        section={currentSection}
        articleId={currentArticleId}
      />
    </HelpContext.Provider>
  );
};