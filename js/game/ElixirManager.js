class ElixirManager {
    constructor() {
        this.elixir = 0;
        this.maxElixir = 10; // Maximum elixir the player can have
        this.elixirRegenRate = 1; // Elixir regenerated per second
        this.elixirRegenInterval = null;
    }

    startElixirRegeneration() {
        this.elixirRegenInterval = setInterval(() => {
            this.regenerateElixir();
        }, 1000);
    }

    stopElixirRegeneration() {
        clearInterval(this.elixirRegenInterval);
    }

    regenerateElixir() {
        if (this.elixir < this.maxElixir) {
            this.elixir += this.elixirRegenRate;
        }
    }

    useElixir(amount) {
        if (this.elixir >= amount) {
            this.elixir -= amount;
            return true; // Successfully used elixir
        }
        return false; // Not enough elixir
    }

    getElixir() {
        return this.elixir;
    }

    setMaxElixir(max) {
        this.maxElixir = max;
    }
}