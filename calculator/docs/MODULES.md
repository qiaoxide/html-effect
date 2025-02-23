# 模块文档

## 核心模块
### CalculatorEngine
- 职责：处理所有计算逻辑
- 依赖：无
- 方法：
  - inputDigit() 处理数字输入
  - compute() 执行计算
  - reset() 重置状态

## 界面模块
### DisplayController
- 职责：管理显示输出和动画
- 依赖：DOM元素
- 方法：
  - update() 更新显示内容
  - showError() 显示错误提示
