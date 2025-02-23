import { CalculatorEngine } from './src/core/CalculatorEngine.js';
import { DisplayController } from './src/ui/DisplayController.js';
import { ThemeManager } from './src/ui/ThemeManager.js';

// 初始化核心模块
const calculator = new CalculatorEngine();
const display = new DisplayController(document.querySelector('.display'));
const themeManager = new ThemeManager();

// 事件处理函数
function handleInput(inputType, value) {
  try {
    switch(inputType) {
      case 'number':
        calculator.inputDigit(value);
        display.update(calculator.currentOperand);
        break;
      case 'operation':
        handleOperation(value);
        break;
      case 'function':
        handleFunction(value);
        break;
    }
  } catch (error) {
    display.showError();
    calculator.reset();
  }
}

function handleOperation(operation) {
  if (operation === '=') {
    calculator.compute();
  } else {
    calculator.setOperation(operation);
  }
  display.update(calculator.currentOperand);
}

function handleFunction(func) {
  switch(func) {
    case 'AC':
      calculator.reset();
      display.update('0');
      break;
    case '±':
      calculator.toggleSign();
      display.update(calculator.currentOperand);
      break;
    case '%':
      calculator.convertPercentage();
      display.update(calculator.currentOperand);
      break;
  }
}

// 事件监听
document.querySelector('.buttons').addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    const btn = e.target;
    const type = btn.classList.contains('num') ? 'number' :
                 btn.classList.contains('operator') ? 'operation' : 'function';
    handleInput(type, btn.textContent);
  }
});

// 键盘支持
document.addEventListener('keydown', (e) => {
  const keyMap = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    '.': '.', 
    '+': '+', '-': '-', '*': '×', '/': '÷',
    'Enter': '=', 'Escape': 'AC'
  };

  const value = keyMap[e.key];
  if (value) {
    e.preventDefault();
    const type = 
      /\d|\./.test(value) ? 'number' :
      '+-×÷='.includes(value) ? 'operation' : 'function';
    handleInput(type, value);
  }
});

// 主题切换
document.querySelector('.theme-switcher').addEventListener('click', (e) => {
  if (e.target.classList.contains('theme-btn')) {
    themeManager.setTheme(e.target.dataset.theme);
  }
});

// 初始化显示
display.update('0');