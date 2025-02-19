export class CountdownTimer {
    constructor() {
        this.countdownInterval = null;
        this.timerElements = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds')
        };
    }

    start(targetDate) {
        this.stop();

        const calculate = () => {
            const now = Date.now();
            const timeLeft = targetDate - now;

            if (timeLeft < 0) {
                this.stop();
                this.showEndMessage();
                return;
            }

            this.updateDisplay(this.calculateTimeLeft(timeLeft));
        };

        calculate();
        this.countdownInterval = setInterval(calculate, 1000);
    }

    stop() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
    }


    calculateTimeLeft(timeLeft) {
        return {
            days: Math.floor(timeLeft / (1000 * 60 * 60 * 24)),
            hours: Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((timeLeft % (1000 * 60)) / 1000)
        };
    }

    updateDisplay(time) {
        Object.keys(time).forEach(key => {
            this.animateNumberChange(this.timerElements[key], time[key]);
        });
    }

    // 设置文字长度到css变量 css中通过var(--text-length)获取
    setStyleTextLengthProperty(element) {
        const length = element.textContent.length;
        element.style.setProperty('--text-length', length);
    }

    animateNumberChange(element, newValue) {
        const numberWrapper = element.querySelector('.number-wrapper');
        const currentSpan = numberWrapper.querySelector('span:first-child');
        const nextSpan = numberWrapper.querySelector('span:last-child');

        // 获取当前值
        const currentValue = parseInt(currentSpan.textContent, 10);

        // 如果值相同，直接返回，不执行动画
        if (currentValue === newValue) {
            return;
        }
        

        // 设置下一个数字
        nextSpan.textContent = newValue.toString().padStart(2, '0');
        this.setStyleTextLengthProperty(nextSpan);

        // 添加动画类
        numberWrapper.classList.add('animate');

        // 动画结束后重置
        setTimeout(() => {
            currentSpan.textContent = newValue.toString().padStart(2, '0');
            this.setStyleTextLengthProperty(currentSpan);
            nextSpan.textContent = (newValue + 1 > 99 ? 0 : newValue + 1).toString().padStart(2, '0');
            this.setStyleTextLengthProperty(nextSpan);
            numberWrapper.classList.remove('animate');
        }, 500); // 与CSS transition时间一致
    }

    showEndMessage() {
        document.querySelector('.countdown-timer').innerHTML = `
            <div style="font-size: 24px; text-align: center;">
                倒计时已结束！🎉
            </div>
        `;
    }
}