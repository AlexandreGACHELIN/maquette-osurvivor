import { Scene } from "phaser";
import { Enemy } from "./Enemy";

export class Game extends Scene {
  constructor() {
    super("Game");
    this.lastAttackTime = 0;
    this.attackCooldown = 5000;
    this.gamePaused = false;
    this.playerHealth = 100; // Santé initiale du joueur
    this.playerMaxHealth = 100; // Santé maximale du joueur
    this.currentPlayerAnimation = "";
    this.currentEnemyAnimations = [];
    this.playerDamage = 50; // Dégâts initiaux du joueur
    this.playerSpeed = 250; // Vitesse de déplacement du joueur (à ajuster selon vos besoins)
  }

  preload() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    
    //Création map avec les tuiles
    this.map = this.make.tilemap({ key: "survivor" });
    const tileset1 = this.map.addTilesetImage("grass", "grass");
    const tileset2 = this.map.addTilesetImage("plant", "plant");
    const tileset3 = this.map.addTilesetImage("props", "props");
    const tileset4 = this.map.addTilesetImage("wall", "wall");

    this.map.createLayer("ground", tileset1);
    this.map.createLayer("top", [tileset2, tileset3, tileset4]);

    //Création Perso Jouable
    this.player = this.physics.add.sprite(959 / 2, 640 / 2, "raiderWalk");
    this.player.body.setSize(this.player.width * 0.3, this.player.height * 0.5);
    this.player.body.setOffset(40, 60);
    this.player.setCollideWorldBounds(true);
    this.player.setImmovable(true);

    //Barre de vie
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    //Animations Player
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

    //Ajout des Enemis dans un groupe
    this.enemies = this.physics.add.group({
      classType: Enemy, // Important pour instantier correctement les ennemis
    });

    //Boucle à utiliser pour le spawn enemy
    this.spawnEvent = this.time.addEvent({
      delay: 5000,
      callback: this.spawnEnemies,
      callbackScope: this,
      loop: true,
    });

    //La caméra suit Player
    this.cameras.main.startFollow(this.player, true);

    // Utilisation de collider pour les interactions entre le joueur et les ennemis
    this.physics.add.collider(
      this.player,
      this.enemies,
      this.handlePlayerEnemyCollision,
      null,
      this
    );

    this.input.keyboard.on("keydown-ESC", () => {
      this.gamePaused = !this.gamePaused;
      if (this.gamePaused) {
        this.pauseGame();
      } else {
        this.resumeGame();
      }
    });
  }

  update(time, delta) {
    if (this.gamePaused) return;

    this.handlePlayerMovement(delta);

    // Nouvelle méthode pour gérer l'attaque automatique éclair
    this.handleAutoAttack(time);

    this.updateHealthBar(); // Assurez-vous que la barre de vie est correctement positionnée et à jour

    this.updateHealthBarPosition();
    console.log('FPS', this.game.loop.actualFps);
    // Mettre à jour chaque ennemi
    this.enemies.children.iterate((enemy) => {
      if (enemy) enemy.update(time, delta);
    });
  }
  //Mapping du Player
  handlePlayerMovement(delta) {
    const speed = this.playerSpeed;
    let velocityX = 0;
    let velocityY = 0;

    // Réinitialise la vitesse du joueur à chaque frame
    this.player.setVelocity(0);

    // Gère les entrées du clavier pour le mouvement horizontal
    if (this.cursors.left.isDown || this.input.keyboard.addKey("Q").isDown) {
      velocityX = -speed;
      this.player.scaleX = -1; // Retourne le sprite pour le mouvement vers la gauche
      this.player.body.offset.x = 80; // Ajuste le décalage si nécessaire
    } else if (
      this.cursors.right.isDown ||
      this.input.keyboard.addKey("D").isDown
    ) {
      velocityX = speed;
      this.player.scaleX = 1;
      this.player.body.offset.x = 40;
    }

    // Gère les entrées du clavier pour le mouvement vertical
    if (this.cursors.up.isDown || this.input.keyboard.addKey("Z").isDown) {
      velocityY = -speed;
    } else if (
      this.cursors.down.isDown ||
      this.input.keyboard.addKey("S").isDown
    ) {
      velocityY = speed;
    }

    // Applique la vitesse calculée au joueur
    this.player.setVelocity(velocityX, velocityY);

    // Joue l'animation appropriée en fonction du mouvement
    if (velocityX !== 0 || velocityY !== 0) {
      this.player.anims.play("walk-side", true);
    } else {
      this.player.anims.play("idle", true);
    }
  }

  //Comportement Collisions Player/Enemy
  handlePlayerEnemyCollision(player, enemy) {
    // Optionnellement, appliquez une petite animation ou un effet visuel pour indiquer la collision
    enemy.setTint(0xff0000); // Change temporairement la couleur de l'ennemi pour rouge
    this.time.delayedCall(500, () => {
      enemy.clearTint(); // Retire la teinte après un court délai
    });

    // Ici, vous pouvez également infliger des dégâts au joueur ou à l'ennemi si nécessaire
    // this.playerTakeDamage(10); // Exemple d'infliger des dégâts au joueur
  }

  // Méthode pour régler les dégâts du joueur en jeu
  setPlayerDamage(damage) {
    this.playerDamage = damage;
  }
  // Réglage du spawn d'enemys
  spawnEnemies() {
    const nombreEnnemis = Phaser.Math.Between(1, 5);
    for (let i = 0; i < nombreEnnemis; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(0, this.scale.height);
      const enemy = new Enemy(this, x, y, "enemy");
      this.enemies.add(enemy);
    }
  }
  //Animation éclair pour attaque Player
  createLightningEffect(x1, y1, x2, y2) {
    let graphics = this.add.graphics({
      lineStyle: { width: 2, color: 0xffff00 },
    });
    graphics.lineBetween(x1, y1, x2, y2);
    this.time.delayedCall(100, () => graphics.clear());
  }
  //Attaque auto Player vers Enemy + conditions mort Enemy
  attackClosestEnemy(closestEnemy) {
    closestEnemy.takeDamage(this.playerDamage);
    if (closestEnemy.health <= 0) {
      // Si la santé de l'ennemi est à 0 ou moins après avoir subi des dégâts, alors le détruire
      this.createLightningEffect(
        this.player.x,
        this.player.y,
        closestEnemy.x,
        closestEnemy.y
      );
      closestEnemy.destroy();
      this.lastAttackTime = this.time.now; // Utilisez this.time.now pour Phaser 3
    }
  }
  //Réglage Mode Pause
  pauseGame() {
    if (this.spawnEvent) this.spawnEvent.paused = true;
    this.physics.pause();
    this.player.anims.pause();
    this.currentEnemyAnimations = []; // Réinitialise le tableau pour les animations ennemies
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.anims.isPlaying) {
        // Stocke directement l'objet ennemi et l'état de son animation
        this.currentEnemyAnimations.push({
          enemy: enemy,
          animKey: enemy.anims.currentAnim.key,
        });
        enemy.anims.stop();
      }
    });
  }
  //Réglage Mode Resume
  resumeGame() {
    if (this.spawnEvent) this.spawnEvent.paused = false;
    this.physics.resume();
    if (this.currentPlayerAnimation) {
      this.player.anims.play(this.currentPlayerAnimation, true);
    }
    // Reprise des animations pour chaque ennemi stocké
    this.currentEnemyAnimations.forEach(({ enemy, animKey }) => {
      if (enemy && enemy.anims) {
        enemy.anims.play(animKey, true);
      }
    });
    this.currentEnemyAnimations = []; // Nettoie le tableau après la reprise
  }
  //MàJ Barre de Vie
  updateHealthBar() {
    this.healthBar.clear();
    let x = this.player.x - 20;
    let y = this.player.y - 40;

    // Fond de la barre de vie
    this.healthBar.fillStyle(0x808080);
    this.healthBar.fillRect(x, y, 40, 5);

    // Barre de santé actuelle
    this.healthBar.fillStyle(0x00ff00);
    let healthWidth = 40 * (this.playerHealth / this.playerMaxHealth);
    this.healthBar.fillRect(x, y, healthWidth, 5);
  }
  //MàJ Position Barre de vie
  updateHealthBarPosition() {
    // Met à jour simplement la position de la barre de vie sans redessiner
    this.updateHealthBar(); // Redessine la barre de vie avec sa nouvelle position et valeur de santé
  }

  playerTakeDamage(amount) {
    this.playerHealth -= amount;
    if (this.playerHealth < 0) {
      this.playerHealth = 0;
    }
    this.updateHealthBar();
    // Ajouter un console.log pour afficher la valeur de playerHealth
    console.log("Player Health:", this.playerHealth);
  }
  handleAutoAttack(time) {
    // Trouver l'ennemi le plus proche et sa distance
    let closestEnemy = null;
    let closestDistance = Infinity;

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

    // Attaque si l'ennemi est dans la portée et que le cooldown est passé
    if (
      closestEnemy &&
      closestDistance < 100 &&
      time > this.lastAttackTime + this.attackCooldown
    ) {
      this.attackClosestEnemy(closestEnemy);
      this.createLightningEffect(
        this.player.x,
        this.player.y,
        closestEnemy.x,
        closestEnemy.y
      );
      this.lastAttackTime = time;
    }
  }
}
