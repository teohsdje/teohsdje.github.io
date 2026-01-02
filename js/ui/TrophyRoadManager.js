console.log('TrophyRoadManager.js loading...');

class TrophyRoadManager {
    constructor() {
        console.log('TrophyRoadManager constructor');
        this.init();
    }
    
    init() {
        this.leagues = [
            { name: 'Drewniana', minTrophies: 0, icon: '🌳', color: '#8B4513' },
            { name: 'Ceglana', minTrophies: 1000, icon: '🧱', color: '#808080' },
            { name: 'Miedziana', minTrophies: 2000, icon: '🟤', color: '#B87333' },
            { name: 'Żelazna', minTrophies: 3000, icon: '⚫', color: '#3D3D3D' },
            { name: 'Brązowa', minTrophies: 5000, icon: '🟫', color: '#CD7F32' },
            { name: 'Stalowa', minTrophies: 7000, icon: '⚙️', color: '#C0C0C0' },
            { name: 'Srebrna', minTrophies: 10000, icon: '⚪', color: '#C0C0C0' },
            { name: 'Złota', minTrophies: 20000, icon: '🟡', color: '#FFD700' },
            { name: 'Platynowa', minTrophies: 30000, icon: '💎', color: '#E5E4E2' },
            { name: 'Szmaragdowa', minTrophies: 50000, icon: '🟢', color: '#50C878' },
            { name: 'Szafirowa', minTrophies: 70000, icon: '🔵', color: '#0F52BA' },
            { name: 'Rubinowa', minTrophies: 100000, icon: '🔴', color: '#E0115F' },
            { name: 'Diamentowa', minTrophies: 200000, icon: '💠', color: '#B9F2FF' },
            { name: 'Mistrzów', minTrophies: 300000, icon: '👑', color: '#FFD700' },
            { name: 'Legend', minTrophies: 500000, icon: '⭐', color: '#FF6B00' },
            { name: 'Immortalnych', minTrophies: 1000000, icon: '🏆', color: '#9400D3' }
        ];
        
        if (!localStorage.getItem('lastRewardTrophies')) {
            localStorage.setItem('lastRewardTrophies', '0');
        }
        
        console.log('TrophyRoadManager initialized');
    }
    
    render() {
        console.log('TrophyRoadManager render');
        
        const container = document.getElementById('trophy-road-rewards');
        if (!container) {
            console.error('Container not found');
            return;
        }
        
        const backBtn = document.getElementById('trophy-road-back');
        if (backBtn && !backBtn.dataset.listenerAdded) {
            backBtn.addEventListener('click', () => {
                window.menuManager.showScreen('menu');
            });
            backBtn.dataset.listenerAdded = 'true';
        }
        
        const playerTrophies = parseInt(localStorage.getItem('trophies') || 0);
        
        container.innerHTML = '';
        
        // Wyświetl tylko ligi
        this.leagues.forEach((league, index) => {
            const nextLeague = this.leagues[index + 1];
            const isUnlocked = playerTrophies >= league.minTrophies;
            const isCurrent = playerTrophies >= league.minTrophies && (!nextLeague || playerTrophies < nextLeague.minTrophies);
            
            const card = document.createElement('div');
            card.className = 'reward-card league-card';
            if (!isUnlocked) card.classList.add('locked');
            if (isCurrent) card.classList.add('current-league');
            
            let progressHtml = '';
            if (nextLeague && isCurrent) {
                const progress = ((playerTrophies - league.minTrophies) / (nextLeague.minTrophies - league.minTrophies)) * 100;
                progressHtml = `
                    <div class="league-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">${playerTrophies} / ${nextLeague.minTrophies}</div>
                    </div>
                `;
            }
            
            card.innerHTML = `
                <div class="reward-header">
                    <div class="league-badge" style="font-size: 48px;">${league.icon}</div>
                </div>
                <div class="league-info">
                    <div class="league-name" style="color: ${league.color}; font-size: 24px; font-weight: bold;">${league.name}</div>
                    <div class="trophy-count" style="font-size: 18px;">${league.minTrophies.toLocaleString()} pucharów</div>
                </div>
                ${progressHtml}
                ${isCurrent ? '<div class="current-badge">AKTUALNIE</div>' : ''}
            `;
            
            container.appendChild(card);
        });
        
        console.log('Render done, leagues:', this.leagues.length);
    }
    
    getLeague(trophies) {
        for (let i = this.leagues.length - 1; i >= 0; i--) {
            if (trophies >= this.leagues[i].minTrophies) {
                return this.leagues[i];
            }
        }
        return this.leagues[0];
    }
    
    checkAndGrantRewards(newTrophies) {
        const lastRewardTrophies = parseInt(localStorage.getItem('lastRewardTrophies') || 0);
        
        const lastMilestone = Math.floor(lastRewardTrophies / 100);
        const currentMilestone = Math.floor(newTrophies / 100);
        
        if (currentMilestone > lastMilestone) {
            const rewardsCount = currentMilestone - lastMilestone;
            
            const coins = parseInt(localStorage.getItem('coins') || 0);
            const gems = parseInt(localStorage.getItem('gems') || 0);
            
            const coinsToAdd = rewardsCount * 100;
            const gemsToAdd = rewardsCount * 10;
            
            localStorage.setItem('coins', coins + coinsToAdd);
            localStorage.setItem('gems', gems + gemsToAdd);
            localStorage.setItem('lastRewardTrophies', currentMilestone * 100);
            
            const message = `Nagroda za ${currentMilestone * 100} pucharów!\n+${coinsToAdd} monet\n+${gemsToAdd} szmaragdów`;
            
            this.showNotification(message);
            
            if (window.menuManager) {
                window.menuManager.updateStatsDisplay();
                window.menuManager.saveGameState(`Auto-nagroda: ${currentMilestone * 100} pucharów`);
            }
        }
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'trophy-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🎁</div>
                <div class="notification-text">${message.replace(/\n/g, '<br>')}</div>
            </div>
        `;
        
        if (!document.getElementById('trophy-notification-style')) {
            const style = document.createElement('style');
            style.id = 'trophy-notification-style';
            style.textContent = `
                .trophy-notification {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    color: white;
                }
                
                .notification-icon {
                    font-size: 48px;
                }
                
                .notification-text {
                    font-size: 20px;
                    font-weight: bold;
                    line-height: 1.4;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translate(-50%, -50%) scale(0.7);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

console.log('TrophyRoadManager.js loaded');
