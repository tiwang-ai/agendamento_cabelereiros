// frontend/src/components/LanguageSelector.tsx
import { MenuItem, Select } from '@mui/material';
import { useLanguage } from '../hooks/useLanguage';

const LanguageSelector = () => {
  const { getCurrentLanguage, changeLanguage } = useLanguage();

  return (
    <Select
      value={getCurrentLanguage()}
      onChange={(e) => changeLanguage(e.target.value as 'pt-BR' | 'en-US')}
      size="small"
    >
      <MenuItem value="pt-BR">Português</MenuItem>
      <MenuItem value="en-US">English</MenuItem>
    </Select>
  );
};

export default LanguageSelector;