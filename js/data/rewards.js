const rewards = {
    chestDropRates: {
        common: 0.50,
        silver: 0.30,
        gold: 0.10,
        platinum: 0.09,
        ruby: 0.01
    },
    chestContents: {
        common: {
            minPoints: 1,
            maxPoints: 50
        },
        silver: {
            minPoints: 51,
            maxPoints: 150
        },
        gold: {
            minPoints: 151,
            maxPoints: 300
        },
        platinum: {
            minPoints: 301,
            maxPoints: 500
        },
        ruby: {
            minPoints: 501,
            maxPoints: 1000
        }
    },
    rewardThresholds: {
        trophyMilestones: [
            { trophies: 100, reward: "100 coins" },
            { trophies: 200, reward: "200 coins" },
            { trophies: 300, reward: "300 coins" },
            { trophies: 400, reward: "400 coins" },
            { trophies: 500, reward: "500 coins" },
            { trophies: 1000, reward: "1 chest" },
            { trophies: 2000, reward: "2 chests" },
            { trophies: 3000, reward: "3 chests" },
            { trophies: 5000, reward: "5 chests" },
            { trophies: 10000, reward: "10 chests" }
        ]
    }
};

export default rewards;