export const getTodayTips = <T>(allCards: T[], groupSize: number = 5): T[] => {
    if (!allCards || allCards.length === 0) {
      return [];
    }
  
    const totalGroups = Math.floor(allCards.length / groupSize);
    if (totalGroups === 0) {
      return allCards;
    }
  
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % totalGroups;
    const start = dayIndex * groupSize;
    return allCards.slice(start, start + groupSize);
  };
  