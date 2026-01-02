class Card {
    constructor(name, hp, attack, maxLevel) {
        this.name = name;
        this.hp = hp;
        this.attack = attack;
        this.level = 1;
        this.maxLevel = maxLevel;
        this.upgradePoints = 0;
    }

    levelUp() {
        if (this.level < this.maxLevel) {
            this.level++;
            this.hp += this.getHpIncrease();
            this.attack += this.getAttackIncrease();
        } else {
            console.log(`${this.name} is already at max level.`);
        }
    }

    getHpIncrease() {
        switch (this.name) {
            case 'Knight':
                return 10;
            case 'Archers':
                return 5;
            case 'Fireball':
                return 0;
            case 'Giant':
                return 100;
            case 'P.E.K.K.A':
                return 5;
            case 'Minion':
                return 10;
            case 'Dragon':
                return 50;
            case 'Bomb Skeleton':
                return 5;
            default:
                return 0;
        }
    }

    getAttackIncrease() {
        switch (this.name) {
            case 'Knight':
                return 5;
            case 'Archers':
                return 10;
            case 'Fireball':
                return 10;
            case 'Giant':
                return 20;
            case 'P.E.K.K.A':
                return 50;
            case 'Minion':
                return 10;
            case 'Dragon':
                return 10;
            case 'Bomb Skeleton':
                return 50;
            default:
                return 0;
        }
    }

    canUpgrade(points) {
        return points >= this.upgradePoints;
    }

    setUpgradePoints(points) {
        this.upgradePoints = points;
    }
}