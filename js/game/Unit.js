class Unit {
    constructor(name, hp, attack, level, maxLevel, owner, x, y) {
        this.name = name;
        this.hp = hp;
        this.maxHp = hp;
        this.attack = attack;
        this.level = level;
        this.maxLevel = maxLevel;
        this.owner = owner; // 'player' or 'opponent'
        this.x = x;
        this.y = y;
        this.alive = true;
        this.speed = this.getSpeed();
        this.range = this.getRange();
        this.attackSpeed = this.getAttackSpeed(); // attacks per second
        this.lastAttackTime = 0;
        this.target = null;
        this.isFlying = this.checkIfFlying();
        this.targetsTowersOnly = this.checkIfTargetsTowersOnly();
        this.element = null;
        this.isSuicideBomber = (name === 'Bomb Skeleton');
        this.hasExploded = false; // Flaga dla bomb skeletona
        this.isSpell = (name === 'Fireball');
        
        if (this.isSuicideBomber) {
            console.log('BOMB SKELETON UTWORZONY:', {
                hp: this.hp,
                attack: this.attack,
                range: this.range,
                targetsTowersOnly: this.targetsTowersOnly,
                isSuicideBomber: this.isSuicideBomber
            });
        }
    }

    getSpeed() {
        switch(this.name) {
            case 'Knight': return 60; // pixels per second
            case 'Archers': return 50;
            case 'Fireball': return 300; // lecący szybko
            case 'Giant': return 30;
            case 'P.E.K.K.A': return 40;
            case 'Minion': return 70;
            case 'Dragon': return 60;
            case 'Bomb Skeleton': return 100;
            default: return 50;
        }
    }

    getRange() {
        switch(this.name) {
            case 'Knight': return 30;
            case 'Archers': return 120;
            case 'Giant': return 30;
            case 'P.E.K.K.A': return 30;
            case 'Minion': return 80;
            case 'Dragon': return 100;
            case 'Bomb Skeleton': return 80; // Duży zasięg wybuchu
            default: return 50;
        }
    }

    getAttackSpeed() {
        switch(this.name) {
            case 'Knight': return 1; // 1 attack per second
            case 'Archers': return 1.5;
            case 'Fireball': return 999; // Natychmiast po dotarciu
            case 'Giant': return 0.8;
            case 'P.E.K.K.A': return 0.5;
            case 'Minion': return 1.2;
            case 'Dragon': return 0.9;
            case 'Bomb Skeleton': return 0; // suicide bomber
            default: return 1;
        }
    }

    checkIfFlying() {
        return this.name === 'Minion' || this.name === 'Dragon';
    }

    checkIfTargetsTowersOnly() {
        return this.name === 'Giant' || this.name === 'Bomb Skeleton';
    }

    levelUp() {
        if (this.level < this.maxLevel) {
            this.level++;
            this.hp += this.getHpIncrease();
            this.maxHp += this.getHpIncrease();
            this.attack += this.getAttackIncrease();
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
                return 10;
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

    takeDamage(damage) {
        // Zaklęcia (spelle) nie mogą być atakowane - ignorują damage
        if (this.isSpell) {
            return;
        }
        
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        }
        
        // Tylko pokaż damage jeśli element istnieje
        if (this.element && this.element.parentNode) {
            this.showDamageNumber(damage);
        }
        
        // Tylko update visual jeśli element istnieje
        if (this.element) {
            this.updateVisual();
        }
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
            damageText.style.left = (this.x) + 'px';
            damageText.style.top = (this.y - 30) + 'px';
            damageText.style.fontSize = '18px';
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

    isAlive() {
        return this.alive;
    }

    update(deltaTime, allUnits, towers) {
        if (!this.alive) return;

        // Dla Fireball - zawsze atakuj wieże
        if (this.isSpell) {
            if (!this.target || (this.target.isDestroyed !== undefined && this.target.isDestroyed)) {
                this.findTargetTower(towers);
            }
        } else {
            // Find target - sprawdź czy cel nadal istnieje i jest żywy
            const targetIsValid = this.target && 
                                 (this.target.alive === true || 
                                  (this.target.isDestroyed !== undefined && !this.target.isDestroyed));
            
            if (!targetIsValid) {
                this.findTarget(allUnits, towers);
            }
        }

        // Move towards target or attack
        if (this.target) {
            const distance = this.getDistance(this.target);
            
            // BOMB SKELETON - wybuchaj gdy dotrzesz blisko celu (dotykasz wieży)
            if (this.isSuicideBomber && !this.hasExploded && distance <= 50) {
                this.performAttack(deltaTime, towers);
                return; // Koniec aktualizacji po wybuchu
            }
            
            // Zwiększ range ataku dla latających jednostek (mają lepszy zasięg)
            let attackRange = this.range;
            if (this.isFlying) {
                attackRange = Math.max(this.range, 60); // Minimum 60 pixels for flying units
            }
            
            if (distance <= attackRange) {
                // In range - attack
                this.performAttack(deltaTime, towers);
                // Jeśli bomb skeleton wybuchł, nie aktualizuj visual (jest już martwy)
                if (this.isSuicideBomber && this.hasExploded) {
                    return;
                }
            } else {
                // Move towards target
                this.moveTowards(this.target, deltaTime);
            }
        } else {
            // No target - move towards enemy side
            this.moveForward(deltaTime);
        }

        // Tylko update visual jeśli element jeszcze istnieje
        if (this.element) {
            this.updateVisual();
        }
    }

    findTargetTower(towers) {
        // Fireball - najpierw wieże pomocnicze, potem główna
        const enemyOwner = this.owner === 'player' ? 'opponent' : 'player';
        
        // Sprawdź czy są boczne wieże
        const sideTowers = towers.filter(t => 
            t.owner === enemyOwner && 
            !t.isDestroyed && 
            t.health > 0 &&
            (t.type === 'left' || t.type === 'right')
        );
        
        if (sideTowers.length > 0) {
            // Jeśli są boczne wieże, TYLKO one mogą być celem
            const randomTower = sideTowers[Math.floor(Math.random() * sideTowers.length)];
            this.target = randomTower;
        } else {
            // TYLKO jeśli NIE MA bocznych wież, atakuj główną
            const mainTower = towers.find(t => 
                t.owner === enemyOwner && 
                !t.isDestroyed && 
                t.health > 0 &&
                t.type === 'main'
            );
            
            if (mainTower) {
                this.target = mainTower;
            } else {
                // Jeśli wszystkie wieże zniszczone, zginąć
                this.alive = false;
                this.target = null;
            }
        }
    }

    findTarget(allUnits, towers) {
        this.target = null;
        let closestDistance = Infinity;

        const enemyOwner = this.owner === 'player' ? 'opponent' : 'player';

        // Giant and Bomb Skeleton target only towers
        if (this.targetsTowersOnly) {
            // Najpierw sprawdź czy są boczne wieże wroga
            const sideTowers = towers.filter(t => 
                t.owner === enemyOwner && 
                !t.isDestroyed && 
                t.health > 0 &&
                (t.type === 'left' || t.type === 'right')
            );
            
            if (sideTowers.length > 0) {
                // Jeśli są boczne wieże, TYLKO one mogą być celem
                sideTowers.forEach(tower => {
                    const distance = this.getDistance(tower);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        this.target = tower;
                    }
                });
            } else {
                // TYLKO jeśli NIE MA bocznych wież, atakuj główną
                const mainTower = towers.find(t => 
                    t.owner === enemyOwner && 
                    !t.isDestroyed && 
                    t.health > 0 &&
                    t.type === 'main'
                );
                
                if (mainTower) {
                    this.target = mainTower;
                }
            }
            
            return;
        }

        // Find closest enemy unit first
        allUnits.forEach(unit => {
            if (unit.owner !== this.owner && unit.alive) {
                // Nie atakuj zaklęć (spellów)
                if (unit.isSpell) {
                    return;
                }
                
                // Flying units can only be attacked by Archers, Minions, or Dragons
                if (unit.isFlying && !this.canAttackFlying()) {
                    return;
                }
                
                const distance = this.getDistance(unit);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    this.target = unit;
                }
            }
        });

        // If no units in range, target towers (najpierw pomocnicze, potem główne)
        if (!this.target || closestDistance > 200) {
            closestDistance = Infinity;
            
            // Najpierw sprawdź czy są boczne wieże wroga
            const enemySideTowers = towers.filter(t => 
                t.owner === enemyOwner && 
                !t.isDestroyed && 
                t.health > 0 &&
                (t.type === 'left' || t.type === 'right')
            );
            
            if (enemySideTowers.length > 0) {
                // Jeśli są boczne wieże, TYLKO one są dostępne do ataku
                enemySideTowers.forEach(tower => {
                    const distance = this.getDistance(tower);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        this.target = tower;
                    }
                });
            } else {
                // TYLKO jeśli NIE MA żadnych bocznych wież, atakuj główną
                const mainTower = towers.find(t => 
                    t.owner === enemyOwner && 
                    !t.isDestroyed && 
                    t.health > 0 &&
                    t.type === 'main'
                );
                if (mainTower) {
                    this.target = mainTower;
                }
            }
        }
    }

    canAttackFlying() {
        return this.name === 'Archers' || this.name === 'Minion' || this.name === 'Dragon';
    }

    getDistance(target) {
        const dx = this.x - target.x;
        const dy = this.y - target.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    moveTowards(target, deltaTime) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const moveDistance = this.speed * (deltaTime / 1000);
            this.x += (dx / distance) * moveDistance;
            this.y += (dy / distance) * moveDistance;
        }
    }

    moveForward(deltaTime) {
        // Move towards enemy side
        const direction = this.owner === 'player' ? -1 : 1;
        this.y += direction * this.speed * (deltaTime / 1000);
    }

    performAttack(deltaTime, towers = []) {
        // Bomb Skeleton - natychmiastowy atak samobójczy (tylko raz)
        if (this.isSuicideBomber && !this.hasExploded) {
            this.hasExploded = true;
            
            // Najpierw zadaj obrażenia
            if (this.target && this.target.takeDamage) {
                this.target.takeDamage(this.attack, towers);
            }
            
            // Potem zabij siebie
            this.hp = 0;
            this.alive = false;
            
            // Dodaj efekt wizualny
            if (this.element && this.element.parentNode) {
                this.element.classList.add('exploding');
                // Usuń element po krótkiej chwili
                setTimeout(() => {
                    this.destroy();
                }, 200);
            }
            return;
        }

        const currentTime = Date.now();
        const timeSinceLastAttack = currentTime - this.lastAttackTime;
        const attackInterval = 1000 / this.attackSpeed; // milliseconds between attacks

        if (timeSinceLastAttack >= attackInterval) {
            if (this.isSpell) {
                // Fireball - zadaj obrażenia i znikn
                this.target.takeDamage(this.attack, towers);
                this.alive = false; // Zniknn po trafieniu
                if (this.element) {
                    this.element.classList.add('spell-hit');
                    setTimeout(() => {
                        this.destroy();
                    }, 300);
                }
            } else {
                // Normal attack
                this.target.takeDamage(this.attack, towers);
            }
            
            this.lastAttackTime = currentTime;
        }
    }

    updateVisual() {
        if (!this.element) return;
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        // Update HP bar if exists
        const hpBar = this.element.querySelector('.unit-hp');
        const hpText = this.element.querySelector('.unit-hp-text');
        
        if (hpBar) {
            const hpPercentage = (this.hp / this.maxHp) * 100;
            hpBar.style.width = Math.max(0, hpPercentage) + '%';
            
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
            hpText.textContent = Math.max(0, Math.floor(this.hp)) + '/' + this.maxHp;
        }
    }

    createVisualElement(container) {
        this.element = document.createElement('div');
        this.element.className = 'unit ' + this.owner;
        if (this.isSpell) {
            this.element.classList.add('spell-projectile');
        }
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';

        const unitIcon = document.createElement('div');
        unitIcon.className = 'unit-icon';
        unitIcon.textContent = this.getIcon();

        const hpBarContainer = document.createElement('div');
        hpBarContainer.className = 'unit-hp-container';
        
        const hpBar = document.createElement('div');
        hpBar.className = 'unit-hp';
        hpBar.style.width = '100%';
        
        const hpText = document.createElement('div');
        hpText.className = 'unit-hp-text';
        hpText.textContent = Math.floor(this.hp) + '/' + this.maxHp;
        
        hpBarContainer.appendChild(hpBar);
        this.element.appendChild(unitIcon);
        
        // HP bar tylko dla non-spell jednostek
        if (!this.isSpell) {
            this.element.appendChild(hpBarContainer);
            this.element.appendChild(hpText);
        }
        
        container.appendChild(this.element);
    }

    getIcon() {
        switch(this.name) {
            case 'Knight': return '🗡️';
            case 'Archers': return '🏹';
            case 'Fireball': return '🔥';
            case 'Giant': return '👹';
            case 'P.E.K.K.A': return '🤖';
            case 'Minion': return '👿';
            case 'Dragon': return '🐉';
            case 'Bomb Skeleton': return '💣';
            default: return '⚔️';
        }
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}