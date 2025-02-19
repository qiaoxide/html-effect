import { CountdownTimer } from './countdown.js';
import { ParticleBackground } from './particle-background.js';
import { StorageManager } from './storage-manager.js';

class App {
    constructor() {
        this.storageManager = new StorageManager();
        this.countdownTimer = new CountdownTimer();
        this.particleBackground = new ParticleBackground();
        this.initEventListeners();
    }

    updateTargetTime(date) {
        const targetTimeElement = document.getElementById('target-time');
        const formattedDate = `目标时间：${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        targetTimeElement.textContent = formattedDate;
    }

    initEventListeners() {
        const targetDateInput = document.getElementById('target-date');
        const startButton = document.getElementById('start-countdown');

        const savedTargetDate = this.storageManager.getTargetDate();
        const nextYear = new Date().getFullYear() + 1;
        const defaultTargetDate = new Date(`${nextYear}-12-31T23:59:59`);

        // 设置默认或保存的目标日期
        const initialTargetDate = savedTargetDate || defaultTargetDate;
        targetDateInput.value = initialTargetDate.toISOString().slice(0, 16);
        this.updateTargetTime(initialTargetDate);
        this.countdownTimer.start(initialTargetDate.getTime());

        startButton.addEventListener('click', () => {
            try {
                const selectedDate = new Date(targetDateInput.value);

                // 验证日期是否有效
                if (isNaN(selectedDate.getTime())) {
                    alert('请选择一个有效的日期');
                    return;
                }

                // 防止选择过去的日期
                if (selectedDate <= new Date()) {
                    alert('请选择一个未来的日期');
                    return;
                }
                //
                this.updateTargetTime(selectedDate);

                this.countdownTimer.start(selectedDate.getTime());
                this.storageManager.saveTargetDate(selectedDate);
            } catch (error) {
                console.error('设置倒计时时发生错误:', error);
                alert('设置倒计时时发生错误，请重试');
            }
        });

        this.particleBackground.init();
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => new App());