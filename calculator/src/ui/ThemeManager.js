/**
 * 主题管理模块
 * 依赖：CSS变量
 * 提供：主题切换、主题存储功能
 */
export class ThemeManager {
  constructor() {
    this.themes = {
      dark: {
        '--primary-color': '#333333',
        '--operator-color': '#ff9f0a',
        '--func-color': '#a5a5a5',
        '--display-bg': '#1c1c1c',
        '--text-color': '#ffffff'
      },
      light: {
        '--primary-color': '#f0f0f0',
        '--operator-color': '#ff9f0a',
        '--func-color': '#d1d1d1',
        '--display-bg': '#ffffff',
        '--text-color': '#000000'
      }
    };
    this.loadTheme();
  }

  setTheme(themeName) {
    const theme = this.themes[themeName];
    Object.entries(theme).forEach(([varName, value]) => {
      document.documentElement.style.setProperty(varName, value);
    });
    localStorage.setItem('calculatorTheme', themeName);
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('calculatorTheme') || 'dark';
    this.setTheme(savedTheme);
  }
}