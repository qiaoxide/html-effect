// navigation.js
document.addEventListener('DOMContentLoaded', () => {
  const initProjectCards = () => {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  };
  
  // 初始化页面元素
  initProjectCards();
  
  // 动态加载模块
  document.querySelectorAll('[data-module]').forEach(element => {
    const moduleName = element.dataset.module;
    import(`./modules/${moduleName}.js`)
      .then(module => module.init(element))
      .catch(err => console.error(`模块加载失败: ${moduleName}`, err));
  });
});