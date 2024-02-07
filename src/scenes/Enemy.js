import Phaser from "phaser";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.health = 50;
        this.maxHealth = 50;
        this.attackRange = 10;
        this.attackDamage = 5;
        this.attackCooldown = 5000;
        this.lastAttackTime = 0;
        this.speed = 100; 

        this.anims.create({
            key: "Zombie-Walk",
            frames: this.anims.generateFrameNumbers("Zombie-Walk", { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1,
        });

        this.play("Zombie-Walk");
        
        this.setCollideWorldBounds(true);
    }

    update(time, delta) {
        if (!this.scene || !this.scene.player) return;

        const player = this.scene.player;
        const direction = player.x - this.x;
        this.flipX = direction < 0;

        const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        // Simplifiez la logique en vérifiant une seule fois si l'ennemi peut attaquer
        if (distanceToPlayer < this.attackRange && time > this.lastAttackTime + this.attackCooldown) {
            this.attackPlayer();
            this.lastAttackTime = time;
        } else if (distanceToPlayer >= this.attackRange) {
            // Se déplacer vers le joueur si hors de portée d'attaque
            this.scene.physics.moveToObject(this, player, this.speed);
        }
    }

    attackPlayer() {
        this.scene.playerTakeDamage(this.attackDamage);
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
        }
    }
}
