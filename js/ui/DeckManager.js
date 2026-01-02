class DeckManager {
    constructor() {
        this.allCards = [
            { id: 'knight', name: 'Knight', icon: '🗡️', cost: 3, level: 1, maxLevel: 10, upgradePoints: 0 },
            { id: 'archers', name: 'Archers', icon: '🏹', cost: 3, level: 1, maxLevel: 10, upgradePoints: 0 },
            { id: 'fireball', name: 'Fireball', icon: '🔥', cost: 4, level: 1, maxLevel: 10, upgradePoints: 0 },
            { id: 'giant', name: 'Giant', icon: '👹', cost: 5, level: 1, maxLevel: 10, upgradePoints: 0 },
            { id: 'pekka', name: 'P.E.K.K.A', icon: '🤖', cost: 7, level: 1, maxLevel: 10, upgradePoints: 0 },
            { id: 'minion', name: 'Minion', icon: '👿', cost: 3, level: 1, maxLevel: 10, upgradePoints: 0 },
            { id: 'dragon', name: 'Dragon', icon: '🐉', cost: 4, level: 1, maxLevel: 10, upgradePoints: 0 },
            { id: 'bomb', name: 'Bomb Skeleton', icon: '💣', cost: 2, level: 1, maxLevel: 10, upgradePoints: 0 }
        ];
        this.deck = [];
        this.loadDeck();
        this.setupEventListeners();
    }

    loadDeck() {
        const savedDeck = localStorage.getItem('playerDeck');
        if (savedDeck) {
            const deckIds = JSON.parse(savedDeck);
            this.deck = deckIds.map(id => this.getCardById(id)).filter(card => card);
        } else {
            // Default deck
            this.deck = [
                this.getCardById('knight'),
                this.getCardById('archers'),
                this.getCardById('fireball'),
                this.getCardById('giant')
            ];
            this.saveDeck();
        }

        // Load card levels
        const cardLevels = localStorage.getItem('cardLevels');
        if (cardLevels) {
            const levels = JSON.parse(cardLevels);
            this.allCards.forEach(card => {
                if (levels[card.id]) {
                    card.level = levels[card.id].level;
                    card.upgradePoints = levels[card.id].upgradePoints;
                }
            });
        }
    }

    getCardById(id) {
        return this.allCards.find(card => card.id === id);
    }

    saveDeck() {
        const deckIds = this.deck.map(card => card.id);
        localStorage.setItem('playerDeck', JSON.stringify(deckIds));
    }

    saveCardLevels() {
        const levels = {};
        this.allCards.forEach(card => {
            levels[card.id] = { level: card.level, upgradePoints: card.upgradePoints };
        });
        localStorage.setItem('cardLevels', JSON.stringify(levels));
    }

    setupEventListeners() {
        document.getElementById('deck-back').addEventListener('click', () => {
            menuManager.showScreen('menu');
        });
    }

    render() {
        this.renderDeckSlots();
        this.renderAvailableCards();
    }

    renderDeckSlots() {
        const slotsContainer = document.getElementById('deck-slots');
        slotsContainer.innerHTML = '';
        
        for (let i = 0; i < 4; i++) {
            const slot = document.createElement('div');
            slot.className = 'deck-slot';
            
            if (i < this.deck.length) {
                const card = this.deck[i];
                slot.classList.add('filled');
                slot.innerHTML = `
                    <button class="remove-from-deck-btn" data-card-id="${card.id}">×</button>
                    <div class="deck-card-icon">${card.icon}</div>
                    <div class="deck-card-name">${card.name}</div>
                    <div class="deck-card-level">Lvl ${card.level}</div>
                    <div class="deck-card-cost">${card.cost}</div>
                `;
                
                slot.querySelector('.remove-from-deck-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeFromDeck(card.id);
                    this.render();
                });
            } else {
                slot.innerHTML = '<div class="empty-slot-text">+</div>';
            }
            
            slotsContainer.appendChild(slot);
        }
    }

    renderAvailableCards() {
        const container = document.getElementById('available-cards-container');
        container.innerHTML = '';
        
        this.allCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card-item';
            const isInDeck = this.deck.some(c => c.id === card.id);
            
            cardElement.innerHTML = `
                <div class="card-visual">
                    <div class="card-icon-large">${card.icon}</div>
                    <div class="card-level-badge">Lvl ${card.level}</div>
                </div>
                <div class="card-details">
                    <h4>${card.name}</h4>
                    <p>Koszt: ${card.cost}</p>
                    <p>Postęp ulepsz.: ${card.upgradePoints}/${5 + card.level * 5}</p>
                    ${card.level < card.maxLevel ? `
                        <button class="upgrade-card-btn" data-card-id="${card.id}">
                            Ulepsz (100 💰)
                        </button>
                    ` : '<p style="color: #ffd700;">Max poziom</p>'}
                </div>
                <div class="deck-action">
                    ${isInDeck ? 
                        '<span class="in-deck-badge">W talii ✓</span>' : 
                        `<button class="add-to-deck-btn" data-card-id="${card.id}">Dodaj</button>`
                    }
                </div>
            `;
            
            const upgradeBtn = cardElement.querySelector('.upgrade-card-btn');
            if (upgradeBtn) {
                upgradeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.upgradeCard(card.id);
                });
            }
            
            const addBtn = cardElement.querySelector('.add-to-deck-btn');
            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (this.deck.length < 4) {
                        this.addToDeck(card.id);
                        this.render();
                    }
                });
            }
            
            container.appendChild(cardElement);
        });
    }

    addToDeck(cardId) {
        if (this.deck.length < 4 && !this.deck.some(c => c.id === cardId)) {
            const card = this.getCardById(cardId);
            if (card) {
                this.deck.push(card);
                this.saveDeck();
            }
        }
    }

    removeFromDeck(cardId) {
        this.deck = this.deck.filter(c => c.id !== cardId);
        this.saveDeck();
    }

    upgradeCard(cardId) {
        const card = this.getCardById(cardId);
        const coins = parseInt(localStorage.getItem('coins') || 0);
        const upgradeCost = 100;

        if (coins >= upgradeCost && card.level < card.maxLevel) {
            card.upgradePoints += 5;
            const pointsNeeded = 5 + card.level * 5;
            
            if (card.upgradePoints >= pointsNeeded) {
                card.level++;
                card.upgradePoints = 0;
                alert(`✓ ${card.name} ulepszony na poziom ${card.level}!`);
            } else {
                alert(`✓ Postęp: ${card.upgradePoints}/${pointsNeeded}`);
            }

            localStorage.setItem('coins', coins - upgradeCost);
            this.saveCardLevels();
            // Zapisz stan gry po ulepszeniu
            menuManager.saveGameState(`Ulepszono ${card.name}`);
            menuManager.updateStatsDisplay();
            this.render();
        } else if (coins < upgradeCost) {
            alert('❌ Nie masz wystarczająco monet!');
        } else {
            alert('❌ Maksymalny poziom!');
        }
    }

    getDeck() {
        return this.deck;
    }
}

const deckManager = new DeckManager();