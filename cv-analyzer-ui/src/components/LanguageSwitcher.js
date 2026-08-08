import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "tr" ? "en" : "tr";
    i18n.changeLanguage(newLang);
  };

  return (
    <Button 
        onClick={toggleLanguage} 
        sx={{ 
            color: 'var(--text-primary)', 
            fontWeight: 'bold', 
            textTransform: 'none',
            fontSize: '1rem',
            marginLeft: '10px'
        }}
    >
      {i18n.language === "tr" ? "EN" : "TR"}
    </Button>
  );
}