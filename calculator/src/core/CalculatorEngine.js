/**
 * 计算器核心逻辑模块
 * 依赖：无
 * 提供：四则运算、连续计算、错误处理功能
 */
export class CalculatorEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this._currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.isNewNumber = true;
  }

  get currentOperand() {
    return this._currentOperand;
  }

  set currentOperand(value) {
    if (value.toString().length > 12) {
      this._currentOperand = 'OVERFLOW';
      this.isNewNumber = true;
      throw new Error('数字溢出');
    }
    this._currentOperand = value;
  }

  inputDigit(digit) {
    if (this.isNewNumber) {
      this.currentOperand = digit;
      this.isNewNumber = false;
    } else {
      this.currentOperand += digit;
    }
  }

  setOperation(operation) {
    if (this.currentOperand === '') return;
    if (this.previousOperand !== '') {
      this.compute();
    }
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
    this.isNewNumber = true;
  }

  compute() {
    if (this.operation === undefined) return;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    
    if (isNaN(prev) || isNaN(current)) {
      throw new Error('无效输入');
    }

    switch(this.operation) {
      case '+':
        this.currentOperand = prev + current;
        break;
      case '-':
        this.currentOperand = prev - current;
        break;
      case '×':
        this.currentOperand = prev * current;
        break;
      case '÷':
        if (current === 0) {
          this.currentOperand = 'Error';
          throw new Error('除零错误');
        }
        this.currentOperand = prev / current;
        break;
    }
    this.operation = undefined;
    this.previousOperand = '';
    this.isNewNumber = true;
  }

  toggleSign() {
    this.currentOperand = (parseFloat(this.currentOperand) * -1).toString();
  }

  convertPercentage() {
    this.currentOperand = (parseFloat(this.currentOperand) / 100).toString();
  }
}