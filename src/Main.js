import { Game } from './scenes/Game';
import { Preloader } from './scenes/Preloader';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
  type: Phaser.AUTO,
  width: 959,
  height: 640,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  parent: 'game-container',
  scene: [Preloader, Game],
	pixelArt: true,
	roundPixels: true
};

export default new Phaser.Game(config);