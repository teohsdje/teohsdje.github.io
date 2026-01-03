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
        // Stały TOP 10 - zawsze te same osoby i puchary
        const fixedRankings = [
            { name: 'ImmortalKing', trophies: 2143287, isPlayer: false },
            { name: 'LegendSlayer', trophies: 2129654, isPlayer: false },
            { name: 'TitanCrusher', trophies: 2114923, isPlayer: false },
            { name: 'PhoenixRise', trophies: 2101476, isPlayer: false },
            { name: 'ShadowMaster', trophies: 2087819, isPlayer: false },
            { name: 'DragonLord', trophies: 2074532, isPlayer: false },
            { name: 'ThunderGod', trophies: 2060891, isPlayer: false },
            { name: 'StormBreaker', trophies: 2047265, isPlayer: false },
            { name: 'NovaCommand', trophies: 2034708, isPlayer: false },
            { name: 'ApexWarrior', trophies: 2020943, isPlayer: false }
        ];

        // Skopiuj bazową listę
        const rankings = [...fixedRankings];

        // Dodaj gracza jeśli ma więcej pucharków niż najsłabszy w TOP 10
        if (playerTrophies > 2020943) {
            rankings.push({
                name: 'TY',
                trophies: playerTrophies,
                isPlayer: true
            });
        }

        // Sortuj od najwyższego do najniższego
        rankings.sort((a, b) => b.trophies - a.trophies);

        // Zwróć tylko TOP 10 (najsłabszy gracz wypadnie jeśli gracz się dostał)
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