class Bot {
    constructor(name, trophies, gameEngine) {
        this.name = name;
        this.trophies = trophies;
        this.gameEngine = gameEngine;
        this.deck = this.generateDeck();
        this.elixir = 5; // Start with 5 elixir
        this.lastPlayTime = 0;
        this.minPlayInterval = 2000; // Minimum 2 seconds between plays
        this.maxPlayInterval = 5000; // Maximum 5 seconds between plays
        this.nextPlayTime = Date.now() + this.getRandomPlayInterval();
        this.difficulty = this.calculateDifficulty(trophies);
    }

    calculateDifficulty(trophies) {
        // Bot difficulty based on trophies (0-1 scale, higher = smarter)
        // Keep bots weak for fast player progression
        return Math.min(0.3, trophies / 10000); // Max 0.3 difficulty (30% smart)
    }

    generateDeck() {
        const availableCards = [
            'Knight', 
            'Archers', 
            'Fireball', 
            'Giant', 
            'P.E.K.K.A', 
            'Minion', 
            'Dragon', 
            'Bomb Skeleton'
        ];
        
        const deck = [];
        const shuffled = availableCards.sort(() => 0.5 - Math.random());
        
        // Select 4 random cards
        for (let i = 0; i < 4; i++) {
            deck.push(shuffled[i]);
        }
        
        return deck;
    }

    getRandomPlayInterval() {
        return this.minPlayInterval + Math.random() * (this.maxPlayInterval - this.minPlayInterval);
    }

    update(deltaTime) {
        const currentTime = Date.now();

        // Update elixir
        this.updateElixir(deltaTime);

        // Check if it's time to play a card
        if (currentTime >= this.nextPlayTime && this.elixir >= 3) {
            const cardPlayed = this.makeMove();
            if (cardPlayed) {
                this.nextPlayTime = currentTime + this.getRandomPlayInterval();
            }
        }
    }

    updateElixir(deltaTime) {
        // Gain 1 elixir per second
        this.elixir += deltaTime / 1000;
        if (this.elixir > 10) this.elixir = 10; // Max elixir cap
    }

    makeMove() {
        if (!this.gameEngine) return null;

        // Get playable cards (cards we can afford)
        const playableCards = this.deck.filter(cardName => {
            const cost = this.getCardCost(cardName);
            return cost <= this.elixir;
        });

        if (playableCards.length === 0) return null;

        // Simple AI: Random decision with slight intelligence
        let selectedCard;
        
        if (Math.random() < this.difficulty) {
            // Smart play - choose based on situation
            selectedCard = this.chooseSmartCard(playableCards);
        } else {
            // Random play (most of the time, since difficulty is low)
            selectedCard = playableCards[Math.floor(Math.random() * playableCards.length)];
        }

        // Determine spawn position (random on opponent's side)
        const spawnX = this.getRandomSpawnX();
        const spawnY = this.getRandomSpawnY();

        // Play the card
        const cost = this.getCardCost(selectedCard);
        if (this.elixir >= cost) {
            this.gameEngine.spawnUnit(selectedCard, 'opponent', spawnX, spawnY);
            this.elixir -= cost;
            return selectedCard;
        }

        return null;
    }

    chooseSmartCard(playableCards) {
        // Very basic intelligence
        const playerUnits = this.gameEngine.units.filter(u => u.owner === 'player' && u.alive);
        
        // If player has many units, use Fireball (if available)
        if (playerUnits.length >= 3 && playableCards.includes('Fireball')) {
            return 'Fireball';
        }

        // If player has flying units, use Archers or Dragon
        const playerHasFlying = playerUnits.some(u => u.isFlying);
        if (playerHasFlying) {
            if (playableCards.includes('Archers')) return 'Archers';
            if (playableCards.includes('Dragon')) return 'Dragon';
        }

        // Otherwise random
        return playableCards[Math.floor(Math.random() * playableCards.length)];
    }

    getCardCost(cardName) {
        switch(cardName) {
            case 'Knight': return 3;
            case 'Archers': return 3;
            case 'Fireball': return 4;
            case 'Giant': return 5;
            case 'P.E.K.K.A': return 7;
            case 'Minion': return 3;
            case 'Dragon': return 4;
            case 'Bomb Skeleton': return 2;
            default: return 3;
        }
    }

    getRandomSpawnX() {
        // Spawn in the middle third of the arena width
        const arenaWidth = 360; // Mobile width
        return 120 + Math.random() * 120;
    }

    getRandomSpawnY() {
        // Spawn on bot's side (top half)
        return 100 + Math.random() * 150;
    }

    updateTrophies(result) {
        if (result === 'win') {
            this.trophies += 30;
        } else if (result === 'lose') {
            this.trophies -= 10;
            if (this.trophies < 0) this.trophies = 0;
        }
    }
}