class GameEngine {
    constructor() {
        this.units = [];
        this.towers = [];
        this.isRunning = false;
        this.lastTime = 0;
        this.playerElixir = 5;
        this.currentBot = null;
        this.gameTime = 0;
        this.maxGameTime = 180000; // 3 minutes in milliseconds
        this.gameContainer = null;
        this.elixirBarElement = null;
        this.gameEnded = false; // Flaga zapobiegająca wielokrotnym wywołaniom endGame()
    }

    init(gameContainer, elixirBarElement) {
        this.gameContainer = gameContainer;
        this.elixirBarElement = elixirBarElement;
        
        // Reset flagi końca gry
        this.gameEnded = false;
        
        // Wyczyść battlefield przed utworzeniem nowych wież
        if (this.gameContainer) {
            this.gameContainer.innerHTML = '';
        }
        
        // Usuń stare wieże z tablicy
        this.towers = [];
        this.units = [];
        
        this.createTowers();
        this.createBot();
        this.startGameLoop();
    }

    createTowers() {
        const playerTrophies = parseInt(localStorage.getItem('trophies')) || 0;
        const league = this.getLeagueByTrophies(playerTrophies);
        const towerHpBonus = league.index * 500;

        // Sprawdź czy aktywny tower defense boost lub premium
        const premiumEnd = parseInt(localStorage.getItem('premiumEnd') || 0);
        const isPremiumActive = premiumEnd > Date.now();
        const towerDefenseBoostEnd = parseInt(localStorage.getItem('towerDefenseBoostEnd') || 0);
        const isTowerDefenseActive = towerDefenseBoostEnd > Date.now();
        const defenseMultiplier = (isTowerDefenseActive || isPremiumActive) ? 1.5 : 1.0;

        // Szerokość areny
        const arenaWidth = 360;
        const leftX = 50;
        const centerX = arenaWidth / 2;
        const rightX = arenaWidth - 50;

        // Wysokość dla gracza (dół) i bota (góra)
        const playerY = 400; // Gracz na dole (zmniejszone żeby panel nie zasłaniał)
        const botY = 50;     // Bot na górze

        // Player towers (gracz - dół) - z bonusem obrony
        this.towers.push(new Tower('player', 'left', Math.floor((500 + towerHpBonus) * defenseMultiplier), 10, leftX, playerY, 120));
        this.towers.push(new Tower('player', 'main', Math.floor((1000 + towerHpBonus) * defenseMultiplier), 10, centerX, playerY, 120));
        this.towers.push(new Tower('player', 'right', Math.floor((500 + towerHpBonus) * defenseMultiplier), 10, rightX, playerY, 120));

        // Opponent towers (bot - góra) - bez bonusu
        this.towers.push(new Tower('opponent', 'left', 500 + towerHpBonus, 10, leftX, botY, 120));
        this.towers.push(new Tower('opponent', 'main', 1000 + towerHpBonus, 10, centerX, botY, 120));
        this.towers.push(new Tower('opponent', 'right', 500 + towerHpBonus, 10, rightX, botY, 120));

        // Create tower visual elements
        this.towers.forEach(tower => {
            tower.createVisualElement(this.gameContainer);
        });
    }

    getLeagueByTrophies(trophies) {
        const leagues = [
            { name: 'Drewniana', min: 0, index: 0 },
            { name: 'Kamienna', min: 1000, index: 1 },
            { name: 'Miedziana', min: 2000, index: 2 },
            { name: 'Żelazna', min: 3000, index: 3 },
            { name: 'Brązowa', min: 5000, index: 4 },
            { name: 'Stalowa', min: 7000, index: 5 },
            { name: 'Srebrna', min: 10000, index: 6 },
            { name: 'Złota', min: 20000, index: 7 },
            { name: 'Platynowa', min: 30000, index: 8 },
            { name: 'Szmaragdowa', min: 50000, index: 9 },
            { name: 'Szafirowa', min: 70000, index: 10 },
            { name: 'Rubinowa', min: 100000, index: 11 },
            { name: 'Diamentowa', min: 200000, index: 12 },
            { name: 'Mistrzów', min: 300000, index: 13 },
            { name: 'Legend', min: 500000, index: 14 },
            { name: 'Immortalnych', min: 1000000, index: 15 }
        ];

        for (let i = leagues.length - 1; i >= 0; i--) {
            if (trophies >= leagues[i].min) {
                return leagues[i];
            }
        }
        return leagues[0];
    }

    createBot() {
        const playerTrophies = parseInt(localStorage.getItem('trophies')) || 0;
        const botTrophies = playerTrophies + Math.floor(Math.random() * 100) - 50;
        const botNames = ['xXProGamerXx', 'NoobMaster', 'DragonSlayer', 'KnightKiller', 'TowerDestroyer', 
                         'ElixirKing', 'CardMaster', 'LegendPlayer', 'EpicWarrior', 'MegaBot'];
        const botName = botNames[Math.floor(Math.random() * botNames.length)];
        
        this.currentBot = new Bot(botName, Math.max(0, botTrophies), this);
        
        // Display bot info
        document.getElementById('opponent-name').textContent = botName;
        document.getElementById('opponent-trophies').textContent = Math.max(0, botTrophies);
    }

    startGameLoop() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        // Update game time
        this.gameTime += deltaTime;

        // Check if game time is over
        if (this.gameTime >= this.maxGameTime) {
            const playerMainTower = this.towers.find(t => t.owner === 'player' && t.type === 'main');
            const opponentMainTower = this.towers.find(t => t.owner === 'opponent' && t.type === 'main');
            
            if (playerMainTower && opponentMainTower) {
                if (playerMainTower.health > opponentMainTower.health) {
                    this.endGame('win');
                } else if (opponentMainTower.health > playerMainTower.health) {
                    this.endGame('lose');
                } else {
                    this.endGame('draw');
                }
            } else {
                this.endGame('draw');
            }
            return;
        }

        // Update elixir
        this.updateElixir(deltaTime);

        // Update bot
        if (this.currentBot) {
            this.currentBot.update(deltaTime);
        }

        // Update all units
        this.units.forEach(unit => {
            if (unit.alive) {
                unit.update(deltaTime, this.units, this.towers);
            }
        });

        // Remove dead units
        this.units = this.units.filter(unit => {
            if (!unit.alive) {
                unit.destroy();
                return false;
            }
            return true;
        });

        // Update towers
        this.towers.forEach(tower => {
            tower.update(deltaTime, this.units, this.towers);
        });

        // Check win/lose conditions
        this.checkGameEnd();

        // Update UI
        this.updateUI();
    }

    updateElixir(deltaTime) {
        // Sprawdź czy booster eliksiru lub premium jest aktywny
        const premiumEnd = parseInt(localStorage.getItem('premiumEnd') || 0);
        const isPremiumActive = premiumEnd > Date.now();
        const boostEndTime = parseInt(localStorage.getItem('elixirBoostEnd') || 0);
        const isBoostActive = boostEndTime > Date.now();

        // Regeneracja eliksiru - 1 na sekundę (2 jeśli booster lub premium aktywny)
        const regenRate = (isBoostActive || isPremiumActive) ? 2 : 1;
        this.playerElixir += (deltaTime / 1000) * regenRate;
        if (this.playerElixir > 10) this.playerElixir = 10;
        
        // Usuń booster z localStorage jeśli wygasł
        if (boostEndTime > 0 && !isBoostActive) {
            localStorage.removeItem('elixirBoostEnd');
        }
    }

    updateUI() {
        // Update elixir bar
        if (this.elixirBarElement) {
            const elixirPercent = (this.playerElixir / 10) * 100;
            this.elixirBarElement.style.width = elixirPercent + '%';
        }

        // Sprawdź premium status
        const premiumEnd = parseInt(localStorage.getItem('premiumEnd') || 0);
        const isPremiumActive = premiumEnd > Date.now();
        const premiumIndicator = document.getElementById('premium-indicator');
        const premiumTime = document.getElementById('premium-time');

        if (isPremiumActive && premiumIndicator && premiumTime) {
            // Pokaż tylko wskaźnik premium
            const timeRemaining = Math.ceil((premiumEnd - Date.now()) / 1000);
            const hours = Math.floor(timeRemaining / 3600);
            const minutes = Math.floor((timeRemaining % 3600) / 60);
            premiumTime.textContent = `${hours}h ${minutes}m`;
            premiumIndicator.style.display = 'flex';
            
            // Ukryj wszystkie inne wskaźniki
            const otherIndicators = ['boost-indicator', 'tower-defense-indicator', 'trophy-boost-indicator', 'reward-boost-indicator'];
            otherIndicators.forEach(id => {
                const indicator = document.getElementById(id);
                if (indicator) indicator.style.display = 'none';
            });
        } else {
            // Ukryj wskaźnik premium
            if (premiumIndicator) premiumIndicator.style.display = 'none';
            if (premiumEnd > 0 && !isPremiumActive) {
                localStorage.removeItem('premiumEnd');
            }
            
            // Pokaż normalne wskaźniki boosterów
            const boostTypes = [
                { key: 'elixirBoostEnd', indicatorId: 'boost-indicator', timeId: 'boost-time' },
                { key: 'towerDefenseBoostEnd', indicatorId: 'tower-defense-indicator', timeId: 'tower-defense-time' },
                { key: 'trophyBoostEnd', indicatorId: 'trophy-boost-indicator', timeId: 'trophy-boost-time' },
                { key: 'rewardBoostEnd', indicatorId: 'reward-boost-indicator', timeId: 'reward-boost-time' }
            ];

            boostTypes.forEach(boost => {
                const boostEndTime = parseInt(localStorage.getItem(boost.key) || 0);
                const isBoostActive = boostEndTime > Date.now();
                const boostIndicator = document.getElementById(boost.indicatorId);
                const boostTime = document.getElementById(boost.timeId);
                
                if (boostIndicator && boostTime) {
                    if (isBoostActive) {
                        const timeRemaining = Math.ceil((boostEndTime - Date.now()) / 1000);
                        const minutes = Math.floor(timeRemaining / 60);
                        const seconds = timeRemaining % 60;
                        boostTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                        boostIndicator.style.display = 'flex';
                    } else {
                        boostIndicator.style.display = 'none';
                        if (boostEndTime > 0) {
                            localStorage.removeItem(boost.key);
                        }
                    }
                }
            });
        }

        // Update time
        const timeLeft = Math.ceil((this.maxGameTime - this.gameTime) / 1000);
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timeElement = document.getElementById('game-time');
        if (timeElement) {
            timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    spawnUnit(cardName, owner, x, y, level = 1) {
        const cardData = this.getCardData(cardName);
        if (!cardData) return;

        // Jeśli bot spawna jednostkę, użyj takiego samego levelu co gracz
        if (owner === 'opponent') {
            const playerLevel = parseInt(localStorage.getItem('playerLevel') || 1);
            level = playerLevel;
        }

        // Oblicz statystyki na podstawie poziomu
        const stats = this.calculateStatsForLevel(cardName, level);

        const unit = new Unit(
            cardName,
            stats.hp,
            stats.attack,
            level,
            cardData.maxLevel,
            owner,
            x,
            y
        );

        unit.createVisualElement(this.gameContainer);
        this.units.push(unit);
    }

    getCardData(cardName) {
        const cardsData = {
            'Knight': { hp: 100, attack: 10, maxLevel: 10, level: 1 },
            'Archers': { hp: 50, attack: 10, maxLevel: 10, level: 1 },
            'Fireball': { hp: 1, attack: 50, maxLevel: 10, level: 1 },
            'Giant': { hp: 1000, attack: 100, maxLevel: 10, level: 1 },
            'P.E.K.K.A': { hp: 100, attack: 300, maxLevel: 10, level: 1 },
            'Minion': { hp: 100, attack: 50, maxLevel: 10, level: 1 },
            'Dragon': { hp: 300, attack: 100, maxLevel: 10, level: 1 },
            'Bomb Skeleton': { hp: 5, attack: 500, maxLevel: 10, level: 1 }
        };

        return cardsData[cardName];
    }

    calculateStatsForLevel(cardName, level) {
        const baseData = this.getCardData(cardName);
        if (!baseData) return { hp: 100, attack: 10 };

        // Zwiększenia na poziom
        const increases = {
            'Knight': { hp: 10, attack: 5 },
            'Archers': { hp: 5, attack: 10 },
            'Fireball': { hp: 0, attack: 10 },
            'Giant': { hp: 100, attack: 20 },
            'P.E.K.K.A': { hp: 5, attack: 50 },
            'Minion': { hp: 10, attack: 10 },
            'Dragon': { hp: 50, attack: 10 },
            'Bomb Skeleton': { hp: 5, attack: 50 }
        };

        const increase = increases[cardName] || { hp: 10, attack: 5 };

        // Oblicz statystyki: bazowe + (zwiększenie * (poziom - 1))
        const hp = baseData.hp + (increase.hp * (level - 1));
        const attack = baseData.attack + (increase.attack * (level - 1));

        return { hp, attack };
    }

    checkGameEnd() {
        // Check if player's main tower is destroyed
        const playerMainTower = this.towers.find(t => t.owner === 'player' && t.type === 'main');
        if (!playerMainTower) return;
        
        // Sprawdź czy wieża jest aktywna (boczne zniszczone) i ma 0 HP
        // LUB czy została zniszczona BĘDĄC aktywną
        if (playerMainTower.sideTowersChecked && playerMainTower.health <= 0) {
            console.log('🔴 KONIEC GRY: Główna wieża gracza zniszczona (była aktywna)');
            this.endGame('lose');
            return;
        }

        // Check if opponent's main tower is destroyed
        const opponentMainTower = this.towers.find(t => t.owner === 'opponent' && t.type === 'main');
        if (!opponentMainTower) return;
        
        // Sprawdź czy wieża jest aktywna (boczne zniszczone) i ma 0 HP
        // LUB czy została zniszczona BĘDĄC aktywną
        if (opponentMainTower.sideTowersChecked && opponentMainTower.health <= 0) {
            console.log('🟢 KONIEC GRY: Główna wieża przeciwnika zniszczona (była aktywna)');
            this.endGame('win');
            return;
        }
    }

    endGame(result) {
        // Zabezpieczenie przed wielokrotnym wywołaniem
        if (this.gameEnded) return;
        this.gameEnded = true;
        
        this.isRunning = false;

        // Usuń wszystkie jednostki z planszy
        this.units.forEach(unit => {
            if (unit.element && unit.element.parentNode) {
                unit.element.parentNode.removeChild(unit.element);
            }
        });
        this.units = [];

        // Update trophies
        let trophies = parseInt(localStorage.getItem('trophies')) || 0;
        let message = '';
        
        // Sprawdź boostery i premium
        const premiumEnd = parseInt(localStorage.getItem('premiumEnd') || 0);
        const isPremiumActive = premiumEnd > Date.now();
        const trophyBoostEnd = parseInt(localStorage.getItem('trophyBoostEnd') || 0);
        const rewardBoostEnd = parseInt(localStorage.getItem('rewardBoostEnd') || 0);
        const isTrophyBoostActive = trophyBoostEnd > Date.now();
        const isRewardBoostActive = rewardBoostEnd > Date.now();

        if (result === 'win') {
            const trophyGain = (isTrophyBoostActive || isPremiumActive) ? 60 : 30;
            trophies += trophyGain;
            message = `Zwycięstwo! +${trophyGain} pucharów`;
            if (isTrophyBoostActive || isPremiumActive) {
                message += ' 🏆⚡';
            }
            
            // Szansa na skrzynkę (zwiększona jeśli aktywny booster nagród lub premium)
            // Premium daje 90% szans na skrzynkę (3x nagrody)
            let chestChance = 0.5;
            if (isPremiumActive) chestChance = 0.9;
            else if (isRewardBoostActive) chestChance = 0.75;
            
            if (Math.random() < chestChance) {
                this.giveChestSilently(isPremiumActive || isRewardBoostActive);
            }
        } else if (result === 'lose') {
            trophies -= 10;
            message = 'Przegrana! -10 pucharów';
        } else {
            message = 'Remis!';
        }
        
        // Usuń wygasłe boostery
        if (trophyBoostEnd > 0 && !isTrophyBoostActive) {
            localStorage.removeItem('trophyBoostEnd');
        }
        if (rewardBoostEnd > 0 && !isRewardBoostActive) {
            localStorage.removeItem('rewardBoostEnd');
        }

        if (trophies < 0) trophies = 0;
        localStorage.setItem('trophies', trophies);

        // Sprawdź i przyznaj automatyczne nagrody
        if (window.trophyRoadManager) {
            window.trophyRoadManager.checkAndGrantRewards(trophies);
        }

        // Zapisz stan gry po koniec rundy
        if (window.menuManager) {
            window.menuManager.saveGameState(`Koniec rundy - ${message.includes('Zwycięstwo') ? 'Wygrana' : message.includes('Przegrana') ? 'Przegrana' : 'Remis'}`);
        }

        // Show result modal and return to menu after 3 seconds
        this.showGameResult(message);

        // Return to menu after 3 seconds and fully reset game
        setTimeout(() => {
            this.cleanup();
            if (window.menuManager) {
                window.menuManager.showMenu();
            }
        }, 3000);
    }

    showGameResult(message) {
        // Create and show result modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px;
            border-radius: 20px;
            color: white;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 10px 50px rgba(0,0,0,0.5);
            border: 3px solid #ffd700;
            min-width: 250px;
        `;
        modal.textContent = message + '\n\nPowrót do menu za 3s...';
        document.body.appendChild(modal);

        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 3000);
    }

    giveChestSilently(rewardBoostActive = false) {
        // Szanse: 50% common, 30% silver, 10% gold, 9% platinum, 1% ruby
        // Jeśli booster aktywny - lepsze szanse
        let rand = Math.random() * 100;
        let chestType;
        let chestName;

        if (rewardBoostActive) {
            // Lepsze szanse z boosterem
            if (rand < 30) {
                chestType = 'common';
                chestName = 'Zwykła Skrzynka';
            } else if (rand < 55) {
                chestType = 'silver';
                chestName = 'Srebrna Skrzynka';
            } else if (rand < 75) {
                chestType = 'gold';
                chestName = 'Złota Skrzynka';
            } else if (rand < 92) {
                chestType = 'platinum';
                chestName = 'Platynowa Skrzynka';
            } else {
                chestType = 'ruby';
                chestName = 'Rubinowa Skrzynka';
            }
        } else {
            // Normalne szanse
            if (rand < 50) {
                chestType = 'common';
                chestName = 'Zwykła Skrzynka';
            } else if (rand < 80) {
                chestType = 'silver';
                chestName = 'Srebrna Skrzynka';
            } else if (rand < 90) {
                chestType = 'gold';
                chestName = 'Złota Skrzynka';
            } else if (rand < 99) {
                chestType = 'platinum';
                chestName = 'Platynowa Skrzynka';
            } else {
                chestType = 'ruby';
                chestName = 'Rubinowa Skrzynka';
            }
        }
        
        // Natychmiast otwórz skrzynkę (jak w shopie)
        if (window.shopManager) {
            window.shopManager.openChest(chestType, chestName);
        }
    }

    stopGame() {
        this.isRunning = false;
        this.cleanup();
    }
    
    cleanup() {
        // Stop game loop
        this.isRunning = false;
        
        // Clear all units
        this.units.forEach(unit => {
            if (unit.element && unit.element.parentNode) {
                unit.element.parentNode.removeChild(unit.element);
            }
        });
        this.units = [];
        
        // Clear all towers
        this.towers.forEach(tower => {
            if (tower.element && tower.element.parentNode) {
                tower.element.parentNode.removeChild(tower.element);
            }
        });
        this.towers = [];
        
        // Reset game state
        this.currentBot = null;
        this.gameTime = 0;
        this.playerElixir = 5;
        
        // Clear battlefield
        if (this.gameContainer) {
            this.gameContainer.innerHTML = '';
        }
    }
}