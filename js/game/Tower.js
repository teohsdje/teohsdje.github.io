class Tower {
    constructor(owner, type, health, attackPower, x, y, range) {
        this.owner = owner; // 'player' or 'opponent'
        this.type = type; // 'left', 'main', 'right'
        this.actualMaxHealth = health; // Prawdziwe HP
        
        // Główne wieże zaczynają z milionem HP, boczne z normalnym
        if (type === 'main') {
            this.health = 1000000;
            this.maxHealth = 1000000;
        } else {
            this.health = health;
            this.maxHealth = health;
        }
        
        this.attackPower = attackPower;
        this.x = x;
        this.y = y;
        this.range = range || 150;
        this.isDestroyed = false;
        this.attackSpeed = 1; // 1 attack per second
        this.lastAttackTime = 0;
        this.element = null;
        this.sideTowersChecked = false; // Flaga czy już sprawdzono boczne wieże
    }

    takeDamage(damage, allTowers = []) {
        this.health = Math.max(0, this.health - damage);
        
        // Loguj HP głównych wież
        if (this.type === 'main') {
            const status = this.sideTowersChecked ? 'AKTYWNA' : 'CHRONIONA';
            console.log(`🏰 [${this.owner.toUpperCase()}] Główna wieża (${status}) | HP: ${Math.floor(this.health)}/${Math.floor(this.maxHealth)} | Real max: ${this.actualMaxHealth} | DMG: ${Math.floor(damage)}`);
        }
        
        if (this.health <= 0) {
            this.health = 0;
            this.isDestroyed = true;
            this.onDestroy();
        }
        
        if (this.element && this.element.parentNode) {
            this.showDamageNumber(damage);
        }
        this.updateVisual();
    }

    showDamageNumber(damage) {
        // Element i parentNode są już sprawdzone w takeDamage
        try {
            const parent = this.element.parentNode;
            if (!parent) return;
            
            const damageText = document.createElement('div');
            damageText.className = 'damage-number';
            damageText.textContent = '-' + Math.floor(damage);
            damageText.style.position = 'absolute';
            damageText.style.left = (this.x + 20) + 'px';
            damageText.style.top = (this.y - 20) + 'px';
            damageText.style.fontSize = '24px';
            damageText.style.fontWeight = 'bold';
            damageText.style.color = '#FF0000';
            damageText.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            damageText.style.zIndex = '100';
            damageText.style.pointerEvents = 'none';
            damageText.style.animation = 'damage-float 1s ease-out';
            
            parent.appendChild(damageText);
            
            setTimeout(() => {
                if (damageText.parentNode) {
                    damageText.parentNode.removeChild(damageText);
                }
            }, 1000);
        } catch (e) {
            // Cicho ignoruj błędy
        }
    }

    onDestroy() {
        if (this.type === 'main') {
            console.log(`💥 [${this.owner.toUpperCase()}] GŁÓWNA WIEŻA ZNISZCZONA! Final HP: ${Math.floor(this.health)}`);
        }
        // If main tower is destroyed, destroy side towers
        if (this.type === 'main' && this.element) {
            this.element.classList.add('destroyed');
        }
    }

    reset() {
        this.health = this.maxHealth;
        this.isDestroyed = false;
        this.updateVisual();
    }

    getHealthPercentage() {
        // Dla głównych wież które jeszcze nie zostały aktywowane, pokazuj 100%
        if (this.type === 'main' && !this.sideTowersChecked) {
            return 100;
        }
        if (this.maxHealth <= 0) return 0;
        return Math.max(0, Math.min(100, (this.health / this.maxHealth) * 100));
    }

    checkAndActivateMainTower(allTowers) {
        // Sprawdź czy wszystkie boczne wieże tego właściciela zostały zniszczone
        const sideTowers = allTowers.filter(t => 
            t.owner === this.owner && 
            (t.type === 'left' || t.type === 'right')
        );
        
        const allSideTowersDestroyed = sideTowers.every(t => t.isDestroyed || t.health <= 0);
        
        if (allSideTowersDestroyed) {
            // Wszystkie boczne wieże zniszczone - ustaw prawdziwe HP
            console.log(`🏰 [${this.owner.toUpperCase()}] AKTYWACJA GŁÓWNEJ WIEŻY! HP zmienione: 1000000 → ${this.actualMaxHealth}`);
            this.sideTowersChecked = true;
            this.maxHealth = this.actualMaxHealth;
            this.health = this.actualMaxHealth;
            this.updateVisual();
        }
    }

    update(deltaTime, units, towers = []) {
        if (this.isDestroyed) return;

        // Jeśli to główna wieża i jeszcze nie sprawdzono bocznych
        if (this.type === 'main' && !this.sideTowersChecked) {
            this.checkAndActivateMainTower(towers);
        }

        // Find and attack enemy units in range
        const target = this.findTarget(units);
        if (target) {
            this.attack(target, deltaTime, towers);
        }
        
        // Zawsze aktualizuj wizualizację
        this.updateVisual();
    }

    findTarget(units) {
        let closestUnit = null;
        let closestDistance = Infinity;

        const enemyOwner = this.owner === 'player' ? 'opponent' : 'player';

        units.forEach(unit => {
            if (unit.owner === enemyOwner && unit.alive) {
                const distance = this.getDistance(unit);
                if (distance <= this.range && distance < closestDistance) {
                    closestDistance = distance;
                    closestUnit = unit;
                }
            }
        });

        return closestUnit;
    }

    getDistance(unit) {
        const dx = this.x - unit.x;
        const dy = this.y - unit.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    attack(target, deltaTime, towers = []) {
        if (!this.isDestroyed) {
            const currentTime = Date.now();
            const timeSinceLastAttack = currentTime - this.lastAttackTime;
            const attackInterval = 1000 / this.attackSpeed;

            if (timeSinceLastAttack >= attackInterval) {
                target.takeDamage(this.attackPower, towers);
                this.lastAttackTime = currentTime;
                
                // Visual feedback
                if (this.element) {
                    this.element.classList.add('attacking');
                    setTimeout(() => {
                        if (this.element) {
                            this.element.classList.remove('attacking');
                        }
                    }, 200);
                }
            }
        }
    }

    createVisualElement(container) {
        // Usuń stary element jeśli istnieje
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        this.element = document.createElement('div');
        this.element.className = `tower ${this.owner} ${this.type}`;
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';

        const towerIcon = document.createElement('div');
        towerIcon.className = 'tower-icon';
        towerIcon.textContent = this.type === 'main' ? '🏰' : '🗼';

        const hpBarContainer = document.createElement('div');
        hpBarContainer.className = 'tower-hp-container';
        
        const hpBar = document.createElement('div');
        hpBar.className = 'tower-hp';
        hpBar.style.width = '100%';
        hpBar.style.backgroundColor = '#4CAF50';
        
        const hpText = document.createElement('div');
        hpText.className = 'tower-hp-text';
        // Dla głównych wież nieaktywowanych pokaż prawdziwe HP
        const displayMaxHp = (this.type === 'main' && !this.sideTowersChecked) ? this.actualMaxHealth : this.maxHealth;
        const displayCurrentHp = (this.type === 'main' && !this.sideTowersChecked) ? this.actualMaxHealth : Math.floor(this.health);
        hpText.textContent = displayCurrentHp + '/' + displayMaxHp;
        
        hpBarContainer.appendChild(hpBar);
        this.element.appendChild(towerIcon);
        this.element.appendChild(hpBarContainer);
        this.element.appendChild(hpText);
        
        container.appendChild(this.element);
        
        // Natychmiast aktualizuj wizualizację
        this.updateVisual();
    }

    updateVisual() {
        if (!this.element) return;
        
        const hpBar = this.element.querySelector('.tower-hp');
        const hpText = this.element.querySelector('.tower-hp-text');
        
        if (hpBar) {
            const hpPercentage = this.getHealthPercentage();
            const clampedPercentage = Math.max(0, Math.min(100, hpPercentage));
            hpBar.style.width = clampedPercentage + '%';
            
            // Color based on health
            if (hpPercentage > 60) {
                hpBar.style.backgroundColor = '#4CAF50';
            } else if (hpPercentage > 30) {
                hpBar.style.backgroundColor = '#FFC107';
            } else {
                hpBar.style.backgroundColor = '#F44336';
            }
        }
        
        if (hpText) {
            // Dla głównych wież nieaktywowanych pokaż prawdziwe HP
            const displayMaxHp = (this.type === 'main' && !this.sideTowersChecked) ? this.actualMaxHealth : Math.floor(this.maxHealth);
            const displayCurrentHp = (this.type === 'main' && !this.sideTowersChecked) ? this.actualMaxHealth : Math.max(0, Math.floor(this.health));
            hpText.textContent = displayCurrentHp + '/' + displayMaxHp;
        }

        if (this.isDestroyed && !this.element.classList.contains('destroyed')) {
            this.element.classList.add('destroyed');
        }
    }
}