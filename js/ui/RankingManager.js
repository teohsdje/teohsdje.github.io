class RankingManager {
    constructor() {
        this.leagues = [
            { name: 'Drewniana', minTrophies: 0, icon: '🌳' },
            { name: 'Ceglana', minTrophies: 1000, icon: '🧱' },
            { name: 'Miedziana', minTrophies: 2000, icon: '🟤' },
            { name: 'Żelazna', minTrophies: 3000, icon: '⚫' },
            { name: 'Brązowa', minTrophies: 5000, icon: '🟫' },
            { name: 'Stalowa', minTrophies: 7000, icon: '⚙️' },
            { name: 'Srebrna', minTrophies: 10000, icon: '⚪' },
            { name: 'Złota', minTrophies: 20000, icon: '🟡' },
            { name: 'Platynowa', minTrophies: 30000, icon: '�' },
            { name: 'Szmaragdowa', minTrophies: 50000, icon: '🟢' },
            { name: 'Szafirowa', minTrophies: 70000, icon: '🔵' },
            { name: 'Rubinowa', minTrophies: 100000, icon: '🔴' },
            { name: 'Diamentowa', minTrophies: 200000, icon: '�' },
            { name: 'Mistrzów', minTrophies: 300000, icon: '👑' },
            { name: 'Legend', minTrophies: 500000, icon: '⭐' },
            { name: 'Immortalnych', minTrophies: 1000000, icon: '🏆' }
        ];
        this.fakeNames = [
            'Thunder', 'Shadow', 'Phoenix', 'Dragon', 'Titan', 'Storm', 'Blaze', 'Nova',
            'Arius', 'Magnus', 'Castor', 'Falcon', 'Rune', 'Nexus', 'Apex', 'Zephyr'
        ];
        this.setupEventListeners();
    }

    setupEventListeners() {
        const backBtn = document.getElementById('ranking-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.menuManager.showScreen('menu');
            });
        }
    }

    render() {
        const playerTrophies = parseInt(localStorage.getItem('trophies') || 0);
        this.displayPlayerInfo(playerTrophies);
        this.displayRankings(playerTrophies);
    }

    displayPlayerInfo(playerTrophies) {
        const container = document.getElementById('player-rank-info');
        const playerLeague = this.getLeague(playerTrophies);
        const nextLeague = this.getNextLeague(playerTrophies);
        
        let progressText = '';
        let progressPercent = 0;
        
        if (nextLeague) {
            const currentLeagueTrophies = playerLeague.minTrophies;
            const leagueRange = nextLeague.minTrophies - currentLeagueTrophies;
            const currentProgress = playerTrophies - currentLeagueTrophies;
            progressPercent = Math.min(100, (currentProgress / leagueRange) * 100);
            progressText = `${playerTrophies}/${nextLeague.minTrophies} pucharów do ${nextLeague.name}`;
        } else {
            progressPercent = 100;
            progressText = 'Maksymalny poziom!';
        }

        container.innerHTML = `
            <div class="player-rank-card">
                <h3>Twój Status</h3>
                <div class="player-league">
                    <div class="league-icon">${playerLeague.icon}</div>
                    <div class="league-info">
                        <p class="league-name">Liga ${playerLeague.name}</p>
                        <p class="player-trophies">🏆 ${playerTrophies} Pucharów</p>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <p class="progress-text">${progressText}</p>
            </div>
        `;
    }

    displayRankings(playerTrophies) {
        const container = document.getElementById('ranking-list');
        const rankings = this.generateRankings(playerTrophies);

        container.innerHTML = '<h3>🏆 TOP 10 Graczy 🏆</h3>';

        rankings.forEach((player, index) => {
            const isPlayer = player.isPlayer;
            const playerLeague = this.getLeague(player.trophies);
            const row = document.createElement('div');
            row.className = `ranking-row ${isPlayer ? 'player-row' : ''}`;

            row.innerHTML = `
                <span class="rank-position">#${index + 1}</span>
                <div class="rank-player-info">
                    <span class="league-icon">${playerLeague.icon}</span>
                    <span class="rank-name">${player.name}</span>
                </div>
                <span class="rank-trophies">🏆 ${player.trophies}</span>
            `;

            container.appendChild(row);
        });
    }

    generateRankings(playerTrophies) {
        const rankings = [];
        
        // Wygeneruj 10 graczy z ligą Immortalnych (1M+ pucharów)
        const usedNames = new Set();
        for (let i = 0; i < 10; i++) {
            // Gracze mają od 1,000,000 do 5,000,000 pucharów
            const baseTrophies = 1000000 + (i * 100000); // 1M, 1.1M, 1.2M...
            const randomBonus = Math.floor(Math.random() * 500000); // +0 do +500k
            const fakeTrophies = baseTrophies + randomBonus;
            
            // Wybierz unikalny nick
            let fakeName;
            do {
                fakeName = this.fakeNames[Math.floor(Math.random() * this.fakeNames.length)];
            } while (usedNames.has(fakeName));
            usedNames.add(fakeName);
            
            rankings.push({
                name: fakeName,
                trophies: fakeTrophies,
                isPlayer: false
            });
        }

        // Sortuj od najwyższego do najniższego
        rankings.sort((a, b) => b.trophies - a.trophies);

        // Zwróć TOP 10 (bez gracza)
        return rankings.slice(0, 10);
    }

    getLeague(trophies) {
        for (let i = this.leagues.length - 1; i >= 0; i--) {
            if (trophies >= this.leagues[i].minTrophies) {
                return this.leagues[i];
            }
        }
        return this.leagues[0];
    }
    
    getNextLeague(trophies) {
        for (let i = 0; i < this.leagues.length; i++) {
            if (trophies < this.leagues[i].minTrophies) {
                return this.leagues[i];
            }
        }
        return null; // Maksymalny poziom
    }
}