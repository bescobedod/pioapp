export const getSafeAlphaColor = (hexColor: string, alpha: string = '20'): string => {
  if (!hexColor || typeof hexColor !== 'string') return 'rgba(150, 150, 150, 0.2)';
  
  const trimmedColor = hexColor.trim();
  
  if (trimmedColor.startsWith('#') && trimmedColor.length === 7) {
    return `${trimmedColor}${alpha}`;
  }
  
  return 'rgba(150, 150, 150, 0.2)';
};
