class MenuManager {
    constructor() {
        this.currentScreen = 'menu';
        this.gameEngine = null;
        this.isSaving = false;
        this.init();
    }

    init() {
        // Załaduj statystyki gracza
        this.loadPlayerStats();
        this.updateStatsDisplay();
        this.setupEventListeners();
        this.showScreen('menu');
        this.checkAndShowChangelog();
    }

    checkAndShowChangelog() {
        const currentVersion = '1.5.0';
        const lastSeenVersion = localStorage.getItem('lastSeenVersion') || '0.0.0';
        
        if (lastSeenVersion !== currentVersion) {
            setTimeout(() => {
                this.showChangelog(currentVersion);
                localStorage.setItem('lastSeenVersion', currentVersion);
            }, 500);
        }
    }

    showChangelog(version) {
        const modal = document.createElement('div');
        modal.className = 'changelog-modal';
        modal.innerHTML = `
            <div class="changelog-content">
                <div class="changelog-header">
                    <h2>🎉 NOWA AKTUALIZACJA ${version}! 🎉</h2>
                </div>
                <div class="changelog-body">
                    <div class="changelog-section">
                        <h3>🏰 Mechanika Wież</h3>
                        <p>• Główna wieża jest teraz chroniona dopóki żyją wieże boczne</p>
                        <p>• Naprawiono błąd przedwczesnego końca gry</p>
                    </div>
                    <div class="changelog-section">
                        <h3>🛒 Nowości w Sklepie</h3>
                        <p>• 💎 Konto Premium 24h</p>
                        <p>• Nowe boostery</p>
                        <p>• Posortowane skrzynki</p>
                    </div>
                    <div class="changelog-section">
                        <h3>⚡ Boostery w Grze</h3>
                        <p>• Wyświetlanie czasu wszystkich aktywnych boosterów</p>
                        <p>• Premium pokazuje jeden wskaźnik zamiast wszystkich</p>
                    </div>
                </div>
                <button class="changelog-close">Świetnie! ✓</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.changelog-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    loadPlayerStats() {
        // Pobierz statystyki z localStorage lub ustaw domyślne
        if (!localStorage.getItem('trophies')) {
            localStorage.setItem('trophies', '0');
        }
        if (!localStorage.getItem('coins')) {
            localStorage.setItem('coins', '500');
        }
        if (!localStorage.getItem('gems')) {
            localStorage.setItem('gems', '50');
        }
        if (!localStorage.getItem('chests')) {
            localStorage.setItem('chests', '[]');
        }
        if (!localStorage.getItem('pln')) {
            localStorage.setItem('pln', '0');
        }
    }

    saveGameState(action = '') {
        if (this.isSaving) return;
        
        this.isSaving = true;
        
        // Pokaż wizualny feedback
        this.showSaveIndicator();
        
        // Wszystko jest już w localStorage, ale upewniamy się że jest zsynchronizowane
        const gameState = {
            trophies: localStorage.getItem('trophies'),
            coins: localStorage.getItem('coins'),
            gems: localStorage.getItem('gems'),
            chests: localStorage.getItem('chests'),
            playerDeck: localStorage.getItem('playerDeck'),
            cardLevels: localStorage.getItem('cardLevels'),
            lastSave: new Date().toISOString(),
            lastAction: action
        };
        
        // Zapisz timestamp ostatniego zapisu
        localStorage.setItem('lastSave', gameState.lastSave);
        
        // Po 300ms wyłącz ikonę
        setTimeout(() => {
            this.isSaving = false;
            this.hideSaveIndicator();
        }, 300);
    }

    showSaveIndicator() {
        let indicator = document.getElementById('save-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'save-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(67, 233, 123, 0.9);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                z-index: 10001;
                animation: saveFlash 0.3s ease;
                box-shadow: 0 4px 12px rgba(67, 233, 123, 0.4);
            `;
            indicator.textContent = '💾 Zapisywanie...';
            document.body.appendChild(indicator);
            
            // Dodaj animację jeśli nie istnieje
            if (!document.querySelector('style[data-save-animation]')) {
                const style = document.createElement('style');
                style.setAttribute('data-save-animation', 'true');
                style.textContent = `
                    @keyframes saveFlash {
                        0% { opacity: 0; transform: scale(0.9); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                `;
                document.head.appendChild(style);
            }
        } else {
            indicator.style.display = 'block';
        }
    }

    hideSaveIndicator() {
        const indicator = document.getElementById('save-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    updateStatsDisplay() {
        const trophies = localStorage.getItem('trophies') || '0';
        const coins = localStorage.getItem('coins') || '0';
        const gems = localStorage.getItem('gems') || '0';

        const trophiesEl = document.getElementById('menu-trophies');
        const coinsEl = document.getElementById('menu-coins');
        const gemsEl = document.getElementById('menu-gems');

        if (trophiesEl) trophiesEl.textContent = trophies;
        if (coinsEl) coinsEl.textContent = coins;
        if (gemsEl) gemsEl.textContent = gems;
    }

    setupEventListeners() {
        // Przyciski menu głównego
        const playBtn = document.getElementById('play-button');
        const deckBtn = document.getElementById('deck-button');
        const trophyRoadBtn = document.getElementById('trophy-road-button');
        const shopBtn = document.getElementById('shop-button');
        const rankingBtn = document.getElementById('ranking-button');

        if (playBtn) {
            playBtn.addEventListener('click', () => this.startGame());
        }
        if (deckBtn) {
            deckBtn.addEventListener('click', () => this.showDeckScreen());
        }
        if (trophyRoadBtn) {
            trophyRoadBtn.addEventListener('click', () => {
                console.log('Trophy Road button clicked');
                this.showTrophyRoadScreen();
            });
        } else {
            console.error('Trophy Road button not found!');
        }
        if (shopBtn) {
            shopBtn.addEventListener('click', () => this.showShopScreen());
        }
        if (rankingBtn) {
            rankingBtn.addEventListener('click', () => this.showRankingScreen());
        }
    }

    showDeckScreen() {
        this.showScreen('deck');
        deckManager.render();
    }

    showTrophyRoadScreen() {
        this.showScreen('trophy-road');
        
        // Wywołaj render bezpośrednio na obiekcie trophyRoadManager jeśli istnieje globalnie
        setTimeout(() => {
            if (window.trophyRoadManager && typeof window.trophyRoadManager.render === 'function') {
                console.log('Calling window.trophyRoadManager.render()');
                window.trophyRoadManager.render();
            } else {
                console.error('window.trophyRoadManager not available');
                // Spróbuj utworzyć nowy jeśli nie istnieje
                if (typeof TrophyRoadManager !== 'undefined') {
                    console.log('Creating new TrophyRoadManager instance');
                    window.trophyRoadManager = new TrophyRoadManager();
                    window.trophyRoadManager.render();
                }
            }
        }, 50);
    }

    showShopScreen() {
        this.showScreen('shop');
        if (window.shopManager) {
            window.shopManager.render();
        } else if (typeof shopManager !== 'undefined') {
            shopManager.render();
        }
    }

    showRankingScreen() {
        this.showScreen('ranking');
        if (window.rankingManager) {
            window.rankingManager.render();
        } else if (typeof rankingManager !== 'undefined') {
            rankingManager.render();
        }
    }

    showScreen(screenName) {
        // Ukryj wszystkie ekrany
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });

        // Pokaż wybrany ekran
        const screen = document.getElementById(screenName);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenName;
        }

        // Jeśli wracamy do menu, odśwież statystyki
        if (screenName === 'menu') {
            this.updateStatsDisplay();
        }
    }

    showMenu() {
        // Zatrzymaj grę jeśli jest uruchomiona
        if (this.gameEngine) {
            this.gameEngine.stopGame();
            this.gameEngine = null;
        }

        this.showScreen('menu');
    }

    startGame() {
        this.showScreen('game');

        // Inicjalizuj grę
        setTimeout(() => {
            const battlefield = document.getElementById('battlefield');
            const elixirBar = document.getElementById('elixir-bar');

            // Zawsze twórz nową instancję gry
            if (this.gameEngine) {
                this.gameEngine.cleanup();
            }
            this.gameEngine = new GameEngine();

            this.gameEngine.init(battlefield, elixirBar);
            this.setupGameControls();
        }, 100);
    }

    setupGameControls() {
        const cardSlots = document.querySelectorAll('.card-slot');
        const battlefield = document.getElementById('battlefield');

        // Pobierz deck gracza
        const playerDeck = deckManager.getDeck();

        cardSlots.forEach((slot, index) => {
            // Ustaw ikony i koszty z talii gracza
            if (index < playerDeck.length) {
                const card = playerDeck[index];
                const iconEl = slot.querySelector('.card-icon');
                const costEl = slot.querySelector('.card-cost');
                
                if (iconEl) iconEl.textContent = card.icon;
                if (costEl) costEl.textContent = card.cost;
                
                slot.dataset.cardName = this.getCardName(card.id);
                slot.dataset.cardCost = card.cost;
            }

            slot.addEventListener('click', (e) => {
                this.playCard(index, e);
            });
        });

        // Drag and drop dla kart
        cardSlots.forEach((slot, index) => {
            let isDragging = false;
            let startX, startY;

            slot.addEventListener('touchstart', (e) => {
                isDragging = true;
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                slot.style.opacity = '0.7';
            });

            slot.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                // Scroll dozwolony - nie blokujemy
            });

            slot.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                isDragging = false;
                slot.style.opacity = '1';

                const touch = e.changedTouches[0];
                const endX = touch.clientX;
                const endY = touch.clientY;

                // Sprawdź czy karta została przeciągnięta na pole bitwy
                const battlefieldRect = battlefield.getBoundingClientRect();
                if (endX >= battlefieldRect.left && endX <= battlefieldRect.right &&
                    endY >= battlefieldRect.top && endY <= battlefieldRect.bottom) {
                    
                    // Oblicz relatywne pozycje na polu bitwy
                    const relativeX = endX - battlefieldRect.left;
                    const relativeY = endY - battlefieldRect.top;
                    
                    this.playCardAtPosition(index, relativeX, relativeY);
                }
            });
        });
    }

    getCardName(cardId) {
        const cardMap = {
            'knight': 'Knight',
            'archers': 'Archers',
            'fireball': 'Fireball',
            'giant': 'Giant',
            'pekka': 'P.E.K.K.A',
            'minion': 'Minion',
            'dragon': 'Dragon',
            'bomb': 'Bomb Skeleton'
        };
        return cardMap[cardId] || 'Knight';
    }

    playCard(cardIndex, event) {
        // Proste kliknięcie - spawn w losowej pozycji
        const battlefield = document.getElementById('battlefield');
        const rect = battlefield.getBoundingClientRect();
        
        const x = rect.width / 2 + (Math.random() - 0.5) * 100;
        const y = rect.height * 0.7 + Math.random() * 50;

        this.playCardAtPosition(cardIndex, x, y);
    }

    playCardAtPosition(cardIndex, x, y) {
        if (!this.gameEngine) return;

        const playerDeck = deckManager.getDeck();
        
        if (cardIndex >= playerDeck.length) return;

        const card = playerDeck[cardIndex];
        const cardName = this.getCardName(card.id);
        const cost = card.cost;
        const level = card.level || 1;

        // Sprawdź czy gracz ma wystarczająco eliksiru
        if (this.gameEngine.playerElixir >= cost) {
            this.gameEngine.spawnUnit(cardName, 'player', x, y, level);
            this.gameEngine.playerElixir -= cost;
            
            // Odśwież UI
            const elixirBar = document.getElementById('elixir-bar');
            if (elixirBar) {
                const percent = (this.gameEngine.playerElixir / 10) * 100;
                elixirBar.style.width = percent + '%';
            }
            
            const elixirText = document.getElementById('elixir-text');
            if (elixirText) {
                elixirText.textContent = `${Math.floor(this.gameEngine.playerElixir)}/10`;
            }
        } else {
            // Brak eliksiru - efekt wizualny
            const slot = document.querySelectorAll('.card-slot')[cardIndex];
            if (slot) {
                slot.style.animation = 'shake 0.3s';
                setTimeout(() => {
                    slot.style.animation = '';
                }, 300);
            }
        }
    }
}

// Inicjalizacja przy załadowaniu strony
let menuManager;
document.addEventListener('DOMContentLoaded', () => {
    menuManager = new MenuManager();
    window.menuManager = menuManager;
});