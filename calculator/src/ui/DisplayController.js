/**
 * 显示控制模块
 * 依赖：DOM元素
 * 提供：显示更新、动画效果、错误提示
 */
export class DisplayController {
  constructor(displayElement) {
    this.display = displayElement;
  }

  update(value) {
    this.display.textContent = value;
    this.#animateUpdate();
  }

  showError() {
    this.display.classList.add('error');
    setTimeout(() => this.display.classList.remove('error'), 1000);
  }

  #animateUpdate() {
    this.display.style.transform = 'scale(1.1)';
    setTimeout(() => {
      this.display.style.transform = 'scale(1)';
    }, 100);
  }
}