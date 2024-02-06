import { Scene } from "phaser";
import { Enemy } from "./Enemy";

export class Game extends Scene {
  constructor() {
    super("Game");
    this.lastAttackTime = 0; // Temps de la dernière attaque
    this.attackCooldown = 2000; // Cooldown en millisecondes (2 secondes dans cet exemple)

    this.player = {};
  }

  preload() {
    // CHARGEMENT DES TOUCHES DU CLAVIER
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    //CHARGEMENT DE LA MAP
    this.map = this.make.tilemap({ key: "survivor" });
    this.tileset1 = this.map.addTilesetImage("grass", "grass");
    this.tileset2 = this.map.addTilesetImage("plant", "plant");
    this.tileset3 = this.map.addTilesetImage("props", "props");
    this.tileset4 = this.map.addTilesetImage("wall", "wall");

    this.groundLayer = this.map.createLayer("ground", this.tileset1);
    this.topLayer = this.map.createLayer("top", [
      this.tileset2,
      this.tileset3,
      this.tileset4,
    ]);

    //CHARGEMENT DU PLAYER
    this.player = this.physics.add.sprite(959 / 2, 640 / 2, "raiderWalk");
    this.player.body.setSize(this.player.width * 0.3, this.player.height * 0.5);
    this.player.body.setOffset(40, 60);

    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    //ANIMATIONS DU PLAYER
    this.anims.create({
      key: "walk-side",
      frames: this.anims.generateFrameNumbers("raiderWalk", {
        start: 0,
        end: 6,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("raiderIdle", {
        start: 0,
        end: 4,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // CREATION D'UN GROUPE POUR LES ENNEMIS
    this.enemies = this.physics.add.group();

    //BOUCLE DE SPAWN D'ENNEMIS
    this.time.addEvent({
      delay: 5000,
      callback: () => this.spawnEnemies(),
      callbackScope: this,
      loop: true,
    });

    //LA CAMERA SUIT LE PLAYER
    this.cameras.main.startFollow(this.player, true);

    // GESTION COLLISIONS
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.playerHit,
      null,
      this
    );
  }

  update(time, delta) {
    const speed = 100;
    let velocityX = 0;
    let velocityY = 0;

    this.player.setVelocity(0, 0);

    if (this.cursors.left.isDown || this.input.keyboard.addKey("A").isDown) {
      velocityX = -speed; // Move left
      this.player.scaleX = -1; // Flip sprite horizontally
      this.player.body.offset.x = 80;
    }
    if (this.cursors.right.isDown || this.input.keyboard.addKey("D").isDown) {
      velocityX = speed; // Move right
      this.player.scaleX = 1; // Reset sprite flip
      this.player.body.offset.x = 40;
    }
    if (this.cursors.up.isDown || this.input.keyboard.addKey("W").isDown) {
      velocityY = -speed; // Move up
    }
    if (this.cursors.down.isDown || this.input.keyboard.addKey("S").isDown) {
      velocityY = speed; // Move down
    }

    // Handle diagonal movement
    if (
      (this.cursors.left.isDown || this.input.keyboard.addKey("A").isDown) &&
      (this.cursors.up.isDown || this.input.keyboard.addKey("W").isDown)
    ) {
      velocityX *= Math.cos(Math.PI / 4);
      velocityY *= Math.sin(Math.PI / 4);
    }
    if (
      (this.cursors.right.isDown || this.input.keyboard.addKey("D").isDown) &&
      (this.cursors.up.isDown || this.input.keyboard.addKey("W").isDown)
    ) {
      velocityX *= Math.cos(Math.PI / 4);
      velocityY *= Math.sin(Math.PI / 4);
    }
    if (
      (this.cursors.left.isDown || this.input.keyboard.addKey("A").isDown) &&
      (this.cursors.down.isDown || this.input.keyboard.addKey("S").isDown)
    ) {
      velocityX *= Math.cos(Math.PI / 4);
      velocityY *= Math.sin(Math.PI / 4);
    }
    if (
      (this.cursors.right.isDown || this.input.keyboard.addKey("D").isDown) &&
      (this.cursors.down.isDown || this.input.keyboard.addKey("S").isDown)
    ) {
      velocityX *= Math.cos(Math.PI / 4);
      velocityY *= Math.sin(Math.PI / 4);
    }

    // Apply velocity
    this.player.setVelocity(velocityX, velocityY);

    // Play animation
    if (velocityX !== 0 || velocityY !== 0) {
      this.player.anims.play("walk-side", true);
    } else {
      this.player.anims.play("idle", true);
    }

    //SELECTIONNE TOUS LES ENNEMIS DU GROUPE ET LES FONT PARTIR VERS THIS.PLAYER
    this.enemies.children.each((enemy) => {
      // Ici, vous ajustez la vitesse des ennemis vers le joueur
      this.physics.moveToObject(enemy, this.player, 50); // 100 est la vitesse
    }, this);

    //TRACKING DE LA PORTEE
    let closestEnemy = null;
    let closestDistance = Infinity;

    // Parcourir tous les ennemis pour trouver le plus proche du joueur
    this.enemies.children.each((enemy) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });
    // Logique de tracking et d'attaque...
    if (closestEnemy && closestDistance < 100) {
      // Vérifier si le cooldown est passé
      if (time > this.lastAttackTime + this.attackCooldown) {
        console.log("Ennemi à portée d'attaque !");
        this.attackClosestEnemy(closestEnemy);
        this.createLightningEffect(
          this.player.x,
          this.player.y,
          closestEnemy.x,
          closestEnemy.y
        );
        closestEnemy.destroy(); // Ou appliquer des dégâts à l'ennemi

        // Mettre à jour le temps de la dernière attaque
        this.lastAttackTime = time;
      }
    }
  }
  spawnEnemies() {
    const nombreEnnemis = Phaser.Math.Between(1, 5);
    for (let i = 0; i < nombreEnnemis; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(0, this.scale.height);
      // Assuming Enemy is correctly set up to handle this construction.
      const enemy = new Enemy(this, x, y);
      this.enemies.add(enemy);

      // Animation configuration would ideally be handled within the Enemy class.
    }
  }

  createLightningEffect(x1, y1, x2, y2) {
    let graphics = this.add.graphics({
      lineStyle: { width: 2, color: 0xffff00 },
    });

    // Calculer la direction de l'éclair
    let dx = x2 - x1;
    let dy = y2 - y1;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let normX = dx / dist;
    let normY = dy / dist;

    let currentX = x1;
    let currentY = y1;

    // Dessiner un zigzag
    graphics.beginPath();
    graphics.moveTo(currentX, currentY);
    let amplitude = 10; // Amplitude du zigzag
    for (let i = 0; i < dist; i += 10) {
      currentX += normX * 10;
      currentY += normY * 10;
      amplitude = -amplitude;
      graphics.lineTo(
        currentX + normY * amplitude,
        currentY - normX * amplitude
      );
    }
    graphics.lineTo(x2, y2);
    graphics.strokePath();

    // Supprimer l'éclair après un court délai pour simuler un effet éphémère
    this.time.delayedCall(100, () => graphics.clear());
  }

  attackClosestEnemy(closestEnemy) {
    if (closestEnemy) {
      // Créer l'effet de slash à la position de l'ennemi
      let slashEffect = this.add.sprite(
        closestEnemy.x,
        closestEnemy.y,
        "slashEffect"
      );

      // Si vous avez une animation pour l'effet, jouez-la ici
      // slashEffect.anims.play('slashAnimation');

      // Supprimer l'effet après un court délai
      this.time.delayedCall(1000, () => {
        slashEffect.destroy();
      });

      // Appliquer les conséquences à l'ennemi (par exemple, le détruire)
      closestEnemy.destroy(); // Ou toute autre logique pour gérer l'ennemi touché
    }
  }
}
