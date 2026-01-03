class ChestSystem {
    constructor() {
        this.chestDropRates = {
            common: 0.50,
            silver: 0.30,
            gold: 0.10,
            platinum: 0.09,
            ruby: 0.01
        };
        this.chestContents = {
            common: { min: 1, max: 5 },
            silver: { min: 5, max: 15 },
            gold: { min: 15, max: 30 },
            platinum: { min: 30, max: 50 },
            ruby: { min: 50, max: 100 }
        };
    }

    getRandomChest() {
        const rand = Math.random();
        let chestType;

        if (rand < this.chestDropRates.common) {
            chestType = 'common';
        } else if (rand < this.chestDropRates.common + this.chestDropRates.silver) {
            chestType = 'silver';
        } else if (rand < this.chestDropRates.common + this.chestDropRates.silver + this.chestDropRates.gold) {
            chestType = 'gold';
        } else if (rand < this.chestDropRates.common + this.chestDropRates.silver + this.chestDropRates.gold + this.chestDropRates.platinum) {
            chestType = 'platinum';
        } else {
            chestType = 'ruby';
        }

        return this.generateChestContents(chestType);
    }

    generateChestContents(chestType) {
        const contents = this.chestContents[chestType];
        const amount = Math.floor(Math.random() * (contents.max - contents.min + 1)) + contents.min;
        return {
            type: chestType,
            amount: amount
        };
    }
}