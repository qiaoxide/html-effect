export class StorageManager {
    saveTargetDate(date) {
        localStorage.setItem('countdownTargetDate', date.getTime());
    }

    getTargetDate() {
        const savedTimestamp = localStorage.getItem('countdownTargetDate');
        return savedTimestamp ? new Date(parseInt(savedTimestamp)) : null;
    }

    clearTargetDate() {
        localStorage.removeItem('countdownTargetDate');
    }
}