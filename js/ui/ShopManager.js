class ShopManager {
    constructor() {
        this.items = [
            // Monety (kupowane za PLN)
            { id: 'coins50', name: '50 Monet', icon: '💰', price: 0.50, type: 'coins', amount: 50, currency: 'pln' },
            { id: 'coins100', name: '100 Monet', icon: '💰', price: 0.90, type: 'coins', amount: 100, currency: 'pln' },
            { id: 'coins500', name: '500 Monet', icon: '💰', price: 4.00, type: 'coins', amount: 500, currency: 'pln' },
            { id: 'coins1000', name: '1000 Monet', icon: '💰', price: 7.50, type: 'coins', amount: 1000, currency: 'pln' },
            { id: 'coins5000', name: '5000 Monet', icon: '💰💰', price: 35.00, type: 'coins', amount: 5000, currency: 'pln' },
            
            // Szmaragdy (kupowane za PLN)
            { id: 'gems10', name: '10 Szmaragdów', icon: '💎', price: 1.00, type: 'gems', amount: 10, currency: 'pln' },
            { id: 'gems50', name: '50 Szmaragdów', icon: '💎', price: 4.50, type: 'gems', amount: 50, currency: 'pln' },
            { id: 'gems100', name: '100 Szmaragdów', icon: '💎💎', price: 8.50, type: 'gems', amount: 100, currency: 'pln' },
            { id: 'gems250', name: '250 Szmaragdów', icon: '💎💎', price: 20.00, type: 'gems', amount: 250, currency: 'pln' },
            { id: 'gems500', name: '500 Szmaragdów', icon: '💎💎💎', price: 38.00, type: 'gems', amount: 500, currency: 'pln' },
            
            // Skrzynki (kupowane za PLN)
            { id: 'common_chest', name: 'Zwykła Skrzynka', icon: '📦', price: 0.50, type: 'chest', rarity: 'common', currency: 'pln' },
            { id: 'silver_chest', name: 'Srebrna Skrzynka', icon: '🪙', price: 1.50, type: 'chest', rarity: 'silver', currency: 'pln' },
            { id: 'gold_chest', name: 'Złota Skrzynka', icon: '🏆', price: 3.50, type: 'chest', rarity: 'gold', currency: 'pln' },
            { id: 'platinum_chest', name: 'Platynowa Skrzynka', icon: '👑', price: 8.00, type: 'chest', rarity: 'platinum', currency: 'pln' },
            { id: 'ruby_chest', name: 'Rubinowa Skrzynka', icon: '💍', price: 15.00, type: 'chest', rarity: 'ruby', currency: 'pln' },
            
            // Premium skrzynki (kupowane za PLN)
            { id: 'mega_chest', name: 'Mega Skrzynka', icon: '🎁', price: 5.00, type: 'chest', rarity: 'platinum', currency: 'pln' },
            { id: 'legend_chest', name: 'Legendarna Skrzynka', icon: '✨', price: 10.00, type: 'chest', rarity: 'ruby', currency: 'pln' },
            
            // Boostery (kupowane za szmaragdy)
            { id: 'elixir_boost', name: 'Booster Eliksiru x2', icon: '⚡', price: 300, type: 'elixir_boost', duration: 600, currency: 'gems' }
        ];
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('shop-back').addEventListener('click', () => {
            menuManager.showScreen('menu');
        });

        document.getElementById('promo-button').addEventListener('click', () => {
            this.redeemPromoCode();
        });

        document.getElementById('promo-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.redeemPromoCode();
        });
    }

    render() {
        this.updateWalletDisplay();
        this.renderShopItems();
    }

    updateWalletDisplay() {
        const pln = parseFloat(localStorage.getItem('pln') || 0);
        const walletElement = document.getElementById('wallet-pln');
        if (walletElement) {
            walletElement.textContent = pln.toFixed(2) + ' PLN';
        }
    }

    renderShopItems() {
        const container = document.getElementById('shop-items');
        container.innerHTML = '';

        // Sekcja monet
        const coinsSection = document.createElement('div');
        coinsSection.className = 'shop-section';
        coinsSection.innerHTML = '<h3>💰 Monety 💰</h3>';
        const coinItems = this.items.filter(item => item.type === 'coins');
        coinItems.forEach(item => {
            const itemEl = this.createItemElement(item);
            coinsSection.appendChild(itemEl);
        });
        container.appendChild(coinsSection);

        // Sekcja szmaragdów
        const gemsSection = document.createElement('div');
        gemsSection.className = 'shop-section';
        gemsSection.innerHTML = '<h3>💎 Szmaragdy 💎</h3>';
        const gemItems = this.items.filter(item => item.type === 'gems');
        gemItems.forEach(item => {
            const itemEl = this.createItemElement(item);
            gemsSection.appendChild(itemEl);
        });
        container.appendChild(gemsSection);

        // Sekcja skrzynek
        const chestSection = document.createElement('div');
        chestSection.className = 'shop-section';
        chestSection.innerHTML = '<h3>🎁 Skrzynki z kartami 🎁</h3>';
        const chestItems = this.items.filter(item => item.type === 'chest');
        chestItems.forEach(item => {
            const itemEl = this.createItemElement(item);
            chestSection.appendChild(itemEl);
        });
        container.appendChild(chestSection);

        // Sekcja boosterów
        const boosterSection = document.createElement('div');
        boosterSection.className = 'shop-section';
        boosterSection.innerHTML = '<h3>⚡ Boostery ⚡</h3>';
        const boosterItems = this.items.filter(item => item.type === 'elixir_boost');
        if (boosterItems.length > 0) {
            boosterItems.forEach(item => {
                const itemEl = this.createItemElement(item);
                boosterSection.appendChild(itemEl);
            });
            container.appendChild(boosterSection);
        }
    }

    createItemElement(item) {
        const el = document.createElement('div');
        el.className = 'shop-item';
        
        let canAfford = false;
        let priceDisplay = '';
        
        if (item.currency === 'pln') {
            const pln = parseFloat(localStorage.getItem('pln') || 0);
            canAfford = pln >= item.price;
            priceDisplay = item.price.toFixed(2) + ' PLN';
        } else if (item.currency === 'gems') {
            const gems = parseInt(localStorage.getItem('gems') || 0);
            canAfford = gems >= item.price;
            priceDisplay = item.price + ' 💎';
        }

        el.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-details">
                <h4>${item.name}</h4>
                ${item.type === 'coins' ? `<p>+${item.amount} monet</p>` : ''}
                ${item.type === 'gems' ? `<p>+${item.amount} szmaragdów</p>` : ''}
                ${item.type === 'chest' ? `<p>Rarietas: ${this.getRarityLabel(item.rarity)}</p>` : ''}
                ${item.type === 'elixir_boost' ? `<p>Czas trwania: ${item.duration / 60} minut</p>` : ''}
                ${item.type === 'elixir_boost' ? `<p>Eliksir x2 podczas gry!</p>` : ''}
                <div class="item-price">
                    ${priceDisplay}
                </div>
            </div>
            <button class="buy-btn ${canAfford ? '' : 'disabled'}" data-item-id="${item.id}">
                ${canAfford ? 'Kup' : 'Brak'}
            </button>
        `;

        const btn = el.querySelector('.buy-btn');
        if (canAfford) {
            btn.addEventListener('click', () => this.purchaseItem(item.id));
        }

        return el;
    }

    getRarityLabel(rarity) {
        const labels = {
            'common': '⚪ Zwykła',
            'silver': '⚫ Srebrna',
            'gold': '🟡 Złota',
            'platinum': '🟣 Platynowa',
            'ruby': '🔴 Rubinowa'
        };
        return labels[rarity] || rarity;
    }

    purchaseItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return;

        const pln = parseFloat(localStorage.getItem('pln') || 0);
        const coins = parseInt(localStorage.getItem('coins') || 0);
        const gems = parseInt(localStorage.getItem('gems') || 0);

        // Sprawdź walutę i możliwość zakupu
        if (item.currency === 'pln' && pln < item.price) {
            alert('❌ Nie masz wystarczająco PLN! Użyj kodu PAPARIPA aby doładować portfel.');
            return;
        }
        
        if (item.currency === 'gems' && gems < item.price) {
            alert('❌ Nie masz wystarczająco szmaragdów!');
            return;
        }

        // Odejmij koszt
        if (item.currency === 'pln') {
            const newPln = (pln - item.price).toFixed(2);
            localStorage.setItem('pln', newPln);
        } else if (item.currency === 'gems') {
            localStorage.setItem('gems', gems - item.price);
        }

        // Dodaj zakupiony przedmiot
        if (item.type === 'coins') {
            localStorage.setItem('coins', coins + item.amount);
            alert(`✓ Otrzymałeś ${item.amount} monet!`);
        } else if (item.type === 'gems') {
            localStorage.setItem('gems', gems + item.amount);
            alert(`✓ Otrzymałeś ${item.amount} szmaragdów!`);
        } else if (item.type === 'chest') {
            // Natychmiast otwórz skrzynkę
            this.openChest(item.rarity, item.name);
        } else if (item.type === 'elixir_boost') {
            const boostEndTime = Date.now() + (item.duration * 1000);
            localStorage.setItem('elixirBoostEnd', boostEndTime);
            alert(`✓ Aktywowano Booster Eliksiru x2 na ${item.duration / 60} minut!\nEliksir będzie regenerować się 2 razy szybciej podczas walki!`);
        }

        // Zapisz stan gry po zakupie
        menuManager.saveGameState(`Kupiono ${item.name}`);
        menuManager.updateStatsDisplay();
        this.render();
    }

    openChest(rarity, name) {
        const chestRewards = {
            'common': { coins: 100, gems: 10 },
            'silver': { coins: 200, gems: 20 },
            'gold': { coins: 400, gems: 40 },
            'platinum': { coins: 700, gems: 70 },
            'ruby': { coins: 1200, gems: 120 }
        };
        
        const maxRewards = chestRewards[rarity] || { coins: 100, gems: 10 };
        const coinsReceived = Math.floor(Math.random() * maxRewards.coins) + 1;
        const gemsReceived = Math.floor(Math.random() * maxRewards.gems) + 1;
        
        const coins = parseInt(localStorage.getItem('coins') || 0);
        const gems = parseInt(localStorage.getItem('gems') || 0);
        
        localStorage.setItem('coins', coins + coinsReceived);
        localStorage.setItem('gems', gems + gemsReceived);
        
        this.showChestNotification(name, coinsReceived, gemsReceived);
        
        if (window.menuManager) {
            window.menuManager.updateStatsDisplay();
        }
    }
    
    showChestNotification(chestName, coins, gems) {
        const notification = document.createElement('div');
        notification.className = 'chest-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">🎁 OTWARTO SKRZYNKĘ! 🎁</div>
                <div class="chest-name-display">${chestName}</div>
                <div class="rewards-list">
                    <div class="reward-line">💰 +${coins} monet</div>
                    <div class="reward-line">💎 +${gems} szmaragdów</div>
                </div>
            </div>
        `;
        
        if (!document.getElementById('chest-notification-style')) {
            const style = document.createElement('style');
            style.id = 'chest-notification-style';
            style.textContent = `
                .chest-notification {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 15px 40px rgba(0,0,0,0.6);
                    z-index: 10000;
                    animation: chestOpen 0.5s ease-out;
                    min-width: 350px;
                    text-align: center;
                }
                
                .notification-title {
                    font-size: 28px;
                    font-weight: bold;
                    color: white;
                    margin-bottom: 15px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                
                .chest-name-display {
                    font-size: 22px;
                    color: #fff;
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                
                .rewards-list {
                    background: rgba(255,255,255,0.2);
                    padding: 20px;
                    border-radius: 10px;
                }
                
                .reward-line {
                    font-size: 24px;
                    font-weight: bold;
                    color: white;
                    margin: 10px 0;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
                }
                
                @keyframes chestOpen {
                    0% {
                        transform: translate(-50%, -50%) scale(0.5) rotate(-10deg);
                        opacity: 0;
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1) rotate(0deg);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'chestOpen 0.4s ease-out reverse';
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    }

    redeemPromoCode() {
        const input = document.getElementById('promo-input');
        const code = input.value.toUpperCase().trim();

        if (code === 'PAPARIPA') {
            const pln = parseFloat(localStorage.getItem('pln') || 0);
            const newPln = (pln + 10).toFixed(2);
            localStorage.setItem('pln', newPln);
            alert('✓ Kod PAPARIPA aktywowany!\n+10.00 PLN');
            input.value = '';
            // Zapisz stan gry po użyciu kodu
            menuManager.saveGameState('Kod PAPARIPA');
            this.render();
        } else if (code.length > 0) {
            alert('❌ Nieznany kod promocyjny!');
        }
    }
}

const shopManager = new ShopManager();