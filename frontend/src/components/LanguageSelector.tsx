// frontend/src/components/LanguageSelector.tsx
import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useLanguage } from '../hooks/useLanguage';

const LanguageSelector = () => {
  const { getCurrentLanguage, changeLanguage } = useLanguage();

  const handleLanguageChange = (e: SelectChangeEvent<string>) => {
    changeLanguage(e.target.value as 'pt-BR' | 'en-US');
  };

  return (
    <Select
      value={getCurrentLanguage()}
      onChange={handleLanguageChange}
      size="small"
    >
      <MenuItem value="pt-BR">Português</MenuItem>
      <MenuItem value="en-US">English</MenuItem>
    </Select>
  );
};

export default LanguageSelector;