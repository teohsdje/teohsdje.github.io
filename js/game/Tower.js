class Tower {
    constructor(owner, type, health, attackPower, x, y, range) {
        this.owner = owner; // 'player' or 'opponent'
        this.type = type; // 'left', 'main', 'right'
        this.health = health;
        this.maxHealth = health;
        this.attackPower = attackPower;
        this.x = x;
        this.y = y;
        this.range = range || 150;
        this.isDestroyed = false;
        this.attackSpeed = 1; // 1 attack per second
        this.lastAttackTime = 0;
        this.element = null;
    }

    takeDamage(damage, allTowers = []) {
        // ABSOLUTNA OCHRONA - GŁÓWNA WIEŻA NIE MOŻE DOSTAĆ OBRAŻEŃ JEŚLI BOCZNE WIEŻE ŻYJĄ
        if (this.type === 'main') {
            const sideTowers = allTowers.filter(t => 
                t.owner === this.owner && 
                !t.isDestroyed && 
                t.health > 0 &&
                (t.type === 'left' || t.type === 'right')
            );
            
            if (sideTowers.length > 0) {
                return; // Główna wieża chroniona
            }
        }
        
        this.health = Math.max(0, this.health - damage);
        
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
        if (this.maxHealth <= 0) return 0;
        return Math.max(0, Math.min(100, (this.health / this.maxHealth) * 100));
    }

    update(deltaTime, units, towers = []) {
        if (this.isDestroyed) return;

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
        hpText.textContent = Math.floor(this.health) + '/' + this.maxHealth;
        
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
            const currentHp = Math.max(0, Math.floor(this.health));
            const maxHp = Math.floor(this.maxHealth);
            hpText.textContent = currentHp + '/' + maxHp;
        }

        if (this.isDestroyed && !this.element.classList.contains('destroyed')) {
            this.element.classList.add('destroyed');
        }
    }
}