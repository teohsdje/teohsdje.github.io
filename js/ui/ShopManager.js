class ShopManager {
    constructor() {
        // Hash SHA-256 hasła podzielony na części (dla bezpieczeństwa)
        this.hashPart1 = '34b9d6131e1aa02283da61e8d8857945';
        this.hashPart2 = '43625284392cd2583445ccdf70c5596a';
        
        // Hash SHA-256 kodu admina podzielony na części
        this.adminHashPart1 = '4e8a8eb7a7afe9d22a6d2820a3f0dc18';
        this.adminHashPart2 = '3d457dc463029de3133aa32cbccee66c';
        
        // Flaga zapobiegająca wielokrotnemu wywołaniu
        this.isProcessingPromo = false;
        
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
        const backBtn = document.getElementById('shop-back');
        const promoBtn = document.getElementById('promo-button');
        const promoInput = document.getElementById('promo-input');
        
        // Usuń stare listenery przez klonowanie elementów
        const newPromoBtn = promoBtn.cloneNode(true);
        promoBtn.parentNode.replaceChild(newPromoBtn, promoBtn);
        
        const newPromoInput = promoInput.cloneNode(true);
        promoInput.parentNode.replaceChild(newPromoInput, promoInput);
        
        backBtn.addEventListener('click', () => {
            menuManager.showScreen('menu');
        });

        newPromoBtn.addEventListener('click', async () => {
            await this.redeemPromoCode();
        });

        newPromoInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                await this.redeemPromoCode();
            }
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

    async sha256(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    async redeemPromoCode() {
        // Zapobiegaj wielokrotnemu wywołaniu
        if (this.isProcessingPromo) {
            console.log('Kod jest już przetwarzany, ignoruję...');
            return;
        }
        
        this.isProcessingPromo = true;
        
        try {
            const input = document.getElementById('promo-input');
            const code = input.value.toUpperCase().trim();

            if (code.length > 0) {
                // Sprawdź kod MILO (jednorazowy, nieszyfrowany)
                if (code === 'MILO') {
                    const miloUsed = localStorage.getItem('miloCodeUsed');
                    if (miloUsed === 'true') {
                        alert('❌ Kod MILO został już wykorzystany!');
                        input.value = '';
                        return;
                    }
                    
                    const pln = parseFloat(localStorage.getItem('pln') || 0);
                    const newPln = (pln + 5).toFixed(2);
                    localStorage.setItem('pln', newPln);
                    localStorage.setItem('miloCodeUsed', 'true');
                    alert('✓ Kod MILO aktywowany!\n+5.00 PLN\n\nKod jest jednorazowy i został zużyty.');
                    input.value = '';
                    menuManager.saveGameState('Kod MILO');
                    this.render();
                    return;
                }
                
                // Generuj hash z wprowadzonego kodu
                const codeHash = await this.sha256(code);
                console.log('Wprowadzony kod:', code);
                console.log('Hash kodu:', codeHash);
                
                // Połącz części zapisanego hasha
                const correctHash = this.hashPart1 + this.hashPart2;
                const adminHash = this.adminHashPart1 + this.adminHashPart2;
                
                console.log('Oczekiwany hash PAPARIPA:', correctHash);
                console.log('Oczekiwany hash ALFREDKOPEC:', adminHash);
                console.log('Czy pasuje do PAPARIPA?', codeHash === correctHash);
                console.log('Czy pasuje do ALFREDKOPEC?', codeHash === adminHash);
                
                if (codeHash === correctHash) {
                    const pln = parseFloat(localStorage.getItem('pln') || 0);
                    const newPln = (pln + 10).toFixed(2);
                    localStorage.setItem('pln', newPln);
                    alert('✓ Kod promocyjny aktywowany!\n+10.00 PLN');
                    input.value = '';
                    // Zapisz stan gry po użyciu kodu
                    menuManager.saveGameState('Kod promocyjny');
                    this.render();
                } else if (codeHash === adminHash) {
                    // Otwórz panel admina
                    console.log('Otwieranie panelu admina...');
                    input.value = '';
                    this.showAdminPanel();
                } else {
                    alert('❌ Nieznany kod promocyjny!');
                }
            }
        } finally {
            // Zawsze odblokuj po zakończeniu
            this.isProcessingPromo = false;
        }
    }

    showAdminPanel() {
        // Utwórz panel admina
        const panel = document.createElement('div');
        panel.id = 'admin-panel';
        panel.className = 'admin-panel';
        
        const trophies = parseInt(localStorage.getItem('trophies') || 0);
        const coins = parseInt(localStorage.getItem('coins') || 0);
        const gems = parseInt(localStorage.getItem('gems') || 0);
        
        panel.innerHTML = `
            <div class="admin-content">
                <div class="admin-header">
                    <h2>🔧 PANEL ADMINA 🔧</h2>
                    <button class="admin-close" id="admin-close">✖</button>
                </div>
                <div class="admin-body">
                    <div class="admin-field">
                        <label>🏆 Puchary:</label>
                        <input type="number" id="admin-trophies" value="${trophies}" min="0">
                    </div>
                    <div class="admin-field">
                        <label>💰 Monety:</label>
                        <input type="number" id="admin-coins" value="${coins}" min="0">
                    </div>
                    <div class="admin-field">
                        <label>💎 Diamenty:</label>
                        <input type="number" id="admin-gems" value="${gems}" min="0">
                    </div>
                    <button class="admin-save" id="admin-save">💾 Zapisz zmiany</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Dodaj style jeśli nie istnieją
        if (!document.getElementById('admin-panel-style')) {
            const style = document.createElement('style');
            style.id = 'admin-panel-style';
            style.textContent = `
                .admin-panel {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease-out;
                    overflow-y: auto;
                }
                
                .admin-content {
                    background: linear-gradient(135deg, #c31432 0%, #240b36 100%);
                    border: 3px solid #ff0000;
                    border-radius: 15px;
                    padding: 20px;
                    max-width: 350px;
                    width: 90%;
                    max-height: 90vh;
                    box-shadow: 0 20px 60px rgba(255, 0, 0, 0.5);
                    animation: slideIn 0.4s ease-out;
                    overflow-y: auto;
                }
                
                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    border-bottom: 2px solid #ff0000;
                    padding-bottom: 10px;
                }
                
                .admin-header h2 {
                    color: #fff;
                    margin: 0;
                    font-size: 20px;
                    text-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
                }
                
                .admin-close {
                    background: #ff0000;
                    color: white;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                }
                
                .admin-close:hover {
                    background: #cc0000;
                    transform: rotate(90deg);
                    box-shadow: 0 6px 15px rgba(255, 0, 0, 0.5);
                }
                
                .admin-body {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .admin-field {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 10px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 0, 0, 0.3);
                }
                
                .admin-field label {
                    color: #fff;
                    font-size: 16px;
                    font-weight: bold;
                    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
                }
                
                .admin-field input {
                    width: 120px;
                    padding: 8px;
                    font-size: 16px;
                    border: 2px solid #ff0000;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.9);
                    color: #333;
                    font-weight: bold;
                    text-align: center;
                }
                
                .admin-field input:focus {
                    outline: none;
                    border-color: #ff3333;
                    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
                }
                
                .admin-save {
                    background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    font-size: 16px;
                    font-weight: bold;
                    border-radius: 10px;
                    cursor: pointer;
                    margin-top: 8px;
                    transition: all 0.3s;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }
                
                .admin-save:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(255, 0, 0, 0.6);
                    background: linear-gradient(135deg, #ff3333 0%, #ee0000 100%);
                }
                
                .admin-save:active {
                    transform: translateY(0);
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateY(-50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Dodaj event listenery
        document.getElementById('admin-close').addEventListener('click', () => {
            panel.remove();
        });
        
        document.getElementById('admin-save').addEventListener('click', () => {
            const newTrophies = parseInt(document.getElementById('admin-trophies').value) || 0;
            const newCoins = parseInt(document.getElementById('admin-coins').value) || 0;
            const newGems = parseInt(document.getElementById('admin-gems').value) || 0;
            
            localStorage.setItem('trophies', newTrophies);
            localStorage.setItem('coins', newCoins);
            localStorage.setItem('gems', newGems);
            
            alert('✓ Wartości zostały zaktualizowane!\n🏆 Puchary: ' + newTrophies + '\n💰 Monety: ' + newCoins + '\n💎 Diamenty: ' + newGems);
            
            // Zapisz stan gry
            menuManager.saveGameState('Panel admina');
            menuManager.updateStatsDisplay();
            this.render();
            
            panel.remove();
        });
        
        // Zamknij panel po kliknięciu w tło
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                panel.remove();
            }
        });
    }
}

const shopManager = new ShopManager();