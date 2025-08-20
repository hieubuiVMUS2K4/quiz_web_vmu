import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState('light');

  // Initialize theme on component mount
  useEffect(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    
    // Add transition disable class to prevent flashing
    document.body.classList.add('theme-transition-disable');
    
    // Remove all theme classes first
    root.removeAttribute('data-theme');
    
    // Apply new theme
    if (newTheme !== 'light') {
      root.setAttribute('data-theme', newTheme);
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const primaryColor = newTheme === 'dark' ? '#4A97C9' : '#1F77B4';
      metaThemeColor.setAttribute('content', primaryColor);
    }
    
    // Re-enable transitions after a short delay
    requestAnimationFrame(() => {
      document.body.classList.remove('theme-transition-disable');
    });
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Dispatch custom event for other components that might need to react
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
  };

  const getThemeIcon = (themeName) => {
    switch (themeName) {
      case 'light':
        return <i className="bi bi-sun-fill me-2"></i>;
      case 'dark':
        return <i className="bi bi-moon-stars-fill me-2"></i>;
      case 'high-contrast':
        return <i className="bi bi-circle-half me-2"></i>;
      default:
        return <i className="bi bi-gear-fill me-2"></i>;
    }
  };

  const getThemeLabel = (themeName) => {
    switch (themeName) {
      case 'light':
        return 'Sáng';
      case 'dark':
        return 'Tối';
      case 'high-contrast':
        return 'Tương phản cao';
      default:
        return 'Tự động';
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Sáng' },
    { value: 'dark', label: 'Tối' },
    { value: 'high-contrast', label: 'Tương phản cao' }
  ];

  return (
    <Dropdown align="end">
      <Dropdown.Toggle 
        variant="outline-secondary" 
        id="theme-switcher"
        size="sm"
        className="d-flex align-items-center"
        title="Chuyển đổi giao diện"
      >
        {getThemeIcon(theme)}
        <span className="d-none d-md-inline">
          {getThemeLabel(theme)}
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>
          <i className="bi bi-palette me-2"></i>
          Giao diện
        </Dropdown.Header>
        <Dropdown.Divider />
        
        {themeOptions.map((option) => (
          <Dropdown.Item
            key={option.value}
            active={theme === option.value}
            onClick={() => handleThemeChange(option.value)}
            className="d-flex align-items-center"
          >
            {getThemeIcon(option.value)}
            {option.label}
            {theme === option.value && (
              <i className="bi bi-check-lg ms-auto text-primary"></i>
            )}
          </Dropdown.Item>
        ))}
        
        <Dropdown.Divider />
        <Dropdown.Item 
          onClick={() => {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            handleThemeChange(systemTheme);
            localStorage.removeItem('theme');
          }}
          className="d-flex align-items-center"
        >
          <i className="bi bi-gear-fill me-2"></i>
          Theo hệ thống
          {!localStorage.getItem('theme') && (
            <i className="bi bi-check-lg ms-auto text-primary"></i>
          )}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ThemeSwitcher;
