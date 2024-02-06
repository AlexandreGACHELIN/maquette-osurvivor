export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Définir ici les animations spécifiques à l'ennemi
    this.anims.create({
      key: 'Zombie-Walk',
      frames: this.anims.generateFrameNumbers('Zombie-Walk', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });

    // Démarrer l'animation de base
    this.play('Zombie-Walk');

    // Variable pour suivre la direction de marche
    this._isWalkingLeft = false;
    this.flipX = this._isWalkingLeft; // Définissez la première orientation de l'image
  }

  // Propriété pour accéder à _isWalkingLeft depuis l'extérieur
  get isWalkingLeft() {
    return this._isWalkingLeft;
  }

  set isWalkingLeft(value) {
    this._isWalkingLeft = value;
    this.flipX = value; // Mettez à jour la propriété flipX en même temps
  }

  // Méthode pour mettre à jour l'animation en fonction de la direction de marche
  updateAnimation(velocityX) {
    if (velocityX < 0) {
      // L'ennemi se déplace vers la gauche
      this.isWalkingLeft = true;
    } else if (velocityX > 0) {
      // L'ennemi se déplace vers la droite
      this.isWalkingLeft = false;
    }
  }

  // Méthode pour mettre à jour l'ennemi
  update(time, delta) {
    // ... Autres mises à jour

    // Calculez la vitesse horizontale de l'ennemi, par exemple, à partir de son corps physique
    const velocityX = 0; // Assurez-vous de calculer correctement cette valeur

    // Appelez la méthode updateAnimation() sur l'ennemi
    this.updateAnimation(velocityX);
  }
}