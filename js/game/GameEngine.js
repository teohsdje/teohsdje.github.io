class GameEngine {
    constructor() {
        this.units = [];
        this.towers = [];
        this.isRunning = false;
        this.lastTime = 0;
        this.playerElixir = 5;
        this.currentBot = null;
        this.gameTime = 0;
        this.maxGameTime = 120000; // 2 minutes in milliseconds
        this.gameContainer = null;
        this.elixirBarElement = null;
    }

    init(gameContainer, elixirBarElement) {
        this.gameContainer = gameContainer;
        this.elixirBarElement = elixirBarElement;
        this.createTowers();
        this.createBot();
        this.startGameLoop();
    }

    createTowers() {
        const playerTrophies = parseInt(localStorage.getItem('trophies')) || 0;
        const league = this.getLeagueByTrophies(playerTrophies);
        const towerHpBonus = league.index * 500;

        // Szerokość areny
        const arenaWidth = 360;
        const leftX = 50;
        const centerX = arenaWidth / 2;
        const rightX = arenaWidth - 50;

        // Wysokość dla gracza (dół) i bota (góra)
        const playerY = 400; // Gracz na dole (zmniejszone żeby panel nie zasłaniał)
        const botY = 50;     // Bot na górze

        // Player towers (gracz - dół)
        this.towers.push(new Tower('player', 'left', 500 + towerHpBonus, 50, leftX, playerY, 120));
        this.towers.push(new Tower('player', 'main', 1000 + towerHpBonus, 100, centerX, playerY, 120));
        this.towers.push(new Tower('player', 'right', 500 + towerHpBonus, 50, rightX, playerY, 120));

        // Opponent towers (bot - góra)
        this.towers.push(new Tower('opponent', 'left', 500 + towerHpBonus, 50, leftX, botY, 120));
        this.towers.push(new Tower('opponent', 'main', 1000 + towerHpBonus, 100, centerX, botY, 120));
        this.towers.push(new Tower('opponent', 'right', 500 + towerHpBonus, 50, rightX, botY, 120));

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
            this.endGame('draw');
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
            tower.update(deltaTime, this.units);
        });

        // Check win/lose conditions
        this.checkGameEnd();

        // Update UI
        this.updateUI();
    }

    updateElixir(deltaTime) {
        // Player gains 1 elixir per second
        this.playerElixir += deltaTime / 1000;
        if (this.playerElixir > 10) this.playerElixir = 10;
    }

    updateUI() {
        // Update elixir bar
        if (this.elixirBarElement) {
            const elixirPercent = (this.playerElixir / 10) * 100;
            this.elixirBarElement.style.width = elixirPercent + '%';
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

    spawnUnit(cardName, owner, x, y) {
        const cardData = this.getCardData(cardName);
        if (!cardData) return;

        const unit = new Unit(
            cardName,
            cardData.hp,
            cardData.attack,
            cardData.level || 1,
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
            'Fireball': { hp: 1, attack: 100, maxLevel: 10, level: 1 },
            'Giant': { hp: 1000, attack: 100, maxLevel: 10, level: 1 },
            'P.E.K.K.A': { hp: 100, attack: 300, maxLevel: 10, level: 1 },
            'Minion': { hp: 100, attack: 50, maxLevel: 10, level: 1 },
            'Dragon': { hp: 300, attack: 100, maxLevel: 10, level: 1 },
            'Bomb Skeleton': { hp: 5, attack: 500, maxLevel: 10, level: 1 }
        };

        return cardsData[cardName];
    }

    checkGameEnd() {
        // Check if player's main tower is destroyed
        const playerMainTower = this.towers.find(t => t.owner === 'player' && t.type === 'main');
        if (playerMainTower && playerMainTower.isDestroyed) {
            this.endGame('lose');
            return;
        }

        // Check if opponent's main tower is destroyed
        const opponentMainTower = this.towers.find(t => t.owner === 'opponent' && t.type === 'main');
        if (opponentMainTower && opponentMainTower.isDestroyed) {
            this.endGame('win');
            return;
        }
    }

    endGame(result) {
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

        if (result === 'win') {
            trophies += 30;
            message = 'Zwycięstwo! +30 pucharów';
            // 50% chance for chest
            if (Math.random() < 0.5) {
                this.giveChestSilently();
            }
        } else if (result === 'lose') {
            trophies -= 10;
            message = 'Przegrana! -10 pucharów';
        } else {
            message = 'Remis!';
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

    giveChestSilently() {
        // Szanse: 50% common, 30% silver, 10% gold, 9% platinum, 1% ruby
        const rand = Math.random() * 100;
        let chestType;
        let chestName;

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