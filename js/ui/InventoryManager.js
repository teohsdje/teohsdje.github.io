class InventoryManager {
    constructor() {
        this.inventoryScreen = document.getElementById('inventory');
        this.chestsContainer = document.getElementById('inventory-chests');
        this.backButton = document.getElementById('inventory-back');
        
        this.chestRewards = {
            'common': { coins: [50, 100], gems: [5, 10] },
            'silver': { coins: [100, 200], gems: [10, 20] },
            'gold': { coins: [200, 400], gems: [20, 40] },
            'platinum': { coins: [400, 700], gems: [40, 70] },
            'ruby': { coins: [700, 1200], gems: [70, 120] }
        };
        
        this.chestIcons = {
            'common': '📦',
            'silver': '🪙',
            'gold': '🏆',
            'platinum': '👑',
            'ruby': '💍'
        };
        
        this.chestNames = {
            'common': 'Zwykła Skrzynka',
            'silver': 'Srebrna Skrzynka',
            'gold': 'Złota Skrzynka',
            'platinum': 'Platynowa Skrzynka',
            'ruby': 'Rubinowa Skrzynka'
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        if (this.backButton) {
            this.backButton.addEventListener('click', () => {
                window.menuManager.showScreen('menu');
            });
        }
    }
    
    render() {
        this.displayChests();
        this.updateStats();
    }
    
    updateStats() {
        const chests = this.getChests();
        const unopenedCount = chests.filter(c => !c.opened).length;
        
        const statsDiv = document.querySelector('.inventory-stats');
        if (statsDiv) {
            statsDiv.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Nieotwarte skrzynki:</span>
                    <span class="stat-value">${unopenedCount}</span>
                </div>
            `;
        }
    }
    
    getChests() {
        const chestsData = localStorage.getItem('chests');
        if (!chestsData) return [];
        try {
            return JSON.parse(chestsData);
        } catch (e) {
            return [];
        }
    }
    
    saveChests(chests) {
        localStorage.setItem('chests', JSON.stringify(chests));
    }
    
    displayChests() {
        const chests = this.getChests();
        const unopenedChests = chests.filter(c => !c.opened);
        
        if (unopenedChests.length === 0) {
            this.chestsContainer.innerHTML = `
                <div class="no-chests">
                    <p>😔 Nie masz żadnych skrzynek!</p>
                    <p class="hint">Wygraj walkę aby zdobyć skrzynkę z nagrodami!</p>
                </div>
            `;
            return;
        }
        
        this.chestsContainer.innerHTML = '';
        
        unopenedChests.forEach(chest => {
            const chestCard = this.createChestCard(chest);
            this.chestsContainer.appendChild(chestCard);
        });
    }
    
    createChestCard(chest) {
        const card = document.createElement('div');
        card.className = 'chest-card';
        card.dataset.chestId = chest.id;
        card.dataset.chestType = chest.type;
        
        const icon = this.chestIcons[chest.type] || '📦';
        const name = this.chestNames[chest.type] || 'Skrzynka';
        
        card.innerHTML = `
            <div class="chest-icon">${icon}</div>
            <div class="chest-name">${name}</div>
            <button class="open-chest-btn">OTWÓRZ</button>
        `;
        
        const openBtn = card.querySelector('.open-chest-btn');
        openBtn.addEventListener('click', () => {
            this.openChest(chest.id, chest.type);
        });
        
        return card;
    }
    
    openChest(chestId, chestType) {
        const rewards = this.chestRewards[chestType];
        if (!rewards) return;
        
        // 50/50 szansa na monety lub szmaragdy
        const giveCoins = Math.random() < 0.5;
        
        let rewardAmount;
        let rewardType;
        let rewardIcon;
        
        if (giveCoins) {
            rewardAmount = this.getRandomReward(rewards.coins);
            rewardType = 'coins';
            rewardIcon = '🪙';
            
            // Dodaj monety
            const currentCoins = parseInt(localStorage.getItem('coins') || 0);
            localStorage.setItem('coins', currentCoins + rewardAmount);
        } else {
            rewardAmount = this.getRandomReward(rewards.gems);
            rewardType = 'gems';
            rewardIcon = '💎';
            
            // Dodaj szmaragdy
            const currentGems = parseInt(localStorage.getItem('gems') || 0);
            localStorage.setItem('gems', currentGems + rewardAmount);
        }
        
        // Oznacz skrzynkę jako otwartą
        const chests = this.getChests();
        const chestIndex = chests.findIndex(c => c.id === chestId);
        if (chestIndex !== -1) {
            chests.splice(chestIndex, 1); // Usuń skrzynkę
            this.saveChests(chests);
        }
        
        // Pokaż animację nagrody
        this.showRewardAnimation(rewardIcon, rewardAmount, this.chestNames[chestType]);
        
        // Odśwież wyświetlanie
        setTimeout(() => {
            this.render();
            window.menuManager.updateStatsDisplay();
            window.menuManager.saveGameState(`Otwarto ${this.chestNames[chestType]}`);
        }, 100);
    }
    
    getRandomReward(range) {
        const [min, max] = range;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    showRewardAnimation(icon, amount, chestName) {
        // Utwórz modal z nagrodą
        const modal = document.createElement('div');
        modal.className = 'reward-modal';
        modal.innerHTML = `
            <div class="reward-content">
                <h2>🎉 ${chestName} otwarta! 🎉</h2>
                <div class="reward-icon-big">${icon}</div>
                <div class="reward-amount">+${amount}</div>
                <button class="reward-close-btn">OK</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animacja pojawienia się
        setTimeout(() => modal.classList.add('show'), 10);
        
        const closeBtn = modal.querySelector('.reward-close-btn');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });
        
        // Auto-zamknięcie po 3 sekundach
        setTimeout(() => {
            if (modal.parentElement) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        }, 3000);
    }
}
