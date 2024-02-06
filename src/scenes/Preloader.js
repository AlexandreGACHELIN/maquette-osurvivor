import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {}

  preload() {
    //  Load the assets for the game
    this.load.setPath('assets');

    this.load.image('grass', 'tiles2/grass.png');
    this.load.image('plant', 'tiles2/plant.png');
    this.load.image('props', 'tiles2/props.png');
    this.load.image('wall', 'tiles2/wall.png');

    this.load.tilemapTiledJSON('survivor', 'tiles2/o-survivor.json');

    this.load.spritesheet('raiderWalk', 'character/Walk.png', {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet('raiderIdle', 'character/Idle_2.png', {
      frameWidth: 128,
      frameHeight: 128,
    });

    this.load.spritesheet('Zombie-Walk', 'enemy/Zombie-Walk.png', {
      frameWidth: 96,
      frameHeight: 96,
    });
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start('Game');
  }
}