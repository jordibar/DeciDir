(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


//________________________________________________________MAIN_____________
'use strict';


var BootState = require('./states/boot');
var MenuState = require('./states/menu');
var PlayState = require('./states/play');
var PreloadState = require('./states/preload');

var game = new Phaser.Game(288, 505, Phaser.AUTO, 'DeciDir_div');

// Game States
game.state.add('boot', BootState);
game.state.add('menu', MenuState);
game.state.add('play', PlayState);
game.state.add('preload', PreloadState);


game.state.start('boot');

  
},{"./states/boot":7,"./states/menu":8,"./states/play":9,"./states/preload":10}],2:[function(require,module,exports){







//____________________________________________________________BIRD prefab (prototype)_
'use strict';

var Bird = function(game, x, y, frame) {
  Phaser.Sprite.call(this, game, x, y, 'papereta', frame);

  // Set the sprite's anchor to the center
  this.anchor.setTo(0.5, 0.5);

  // Add and play animations
  this.animations.add('flap');
  this.animations.play('flap', 12, true);

  // Add physics body to our papereta prefab,
  // now, the game recongnize this sprite as having physics
  this.game.physics.arcade.enableBody(this);

};

Bird.prototype = Object.create(Phaser.Sprite.prototype);
Bird.prototype.constructor = Bird;




Bird.prototype.update = function() {

  // Create a flap() method
  Bird.prototype.flap = function()
  {
    // Tell physics body to have a velocity of -400
    // this will make our bird will immediately move upward at 400 px per second
    // this method is called in play state
    this.body.velocity.y = -400;
  }

};

module.exports = Bird;


},{}],3:[function(require,module,exports){








//____________________________________________________________GROUND prefab (prototype)_
'use strict';

var Ground = function(game, x, y, width, height) {
  Phaser.TileSprite.call(this, game, x, y, width, height, 'ground');

  // start scrolling our ground
  // it seems to run
  this.autoScroll(-200,0);

  // enable physics on the ground sprite
  // this is needed for collision detection
  this.game.physics.arcade.enableBody(this);

  // we don't want the ground's body
  // to be affected by gravity
  // this.body is a reference to a GameObject's physics body
  this.body.allowGravity = false;

  // Told our physics system to have the ground not react to collisions
  // tells the physics system that any Ground object created should only
  // react to physics created and set by itself, and not from external forces
  this.body.immovable = true;
  
};

Ground.prototype = Object.create(Phaser.TileSprite.prototype);
Ground.prototype.constructor = Ground;

Ground.prototype.update = function() {

  
};

module.exports = Ground;
},{}],4:[function(require,module,exports){
'use strict';

var Pipe = function(game, x, y, frame) {
  Phaser.Sprite.call(this, game, x, y, 'pipe', frame);
  this.anchor.setTo(0.5, 0.5);
  this.game.physics.arcade.enableBody(this);

  this.body.allowGravity = false;
  this.body.immovable = true;
  
};

Pipe.prototype = Object.create(Phaser.Sprite.prototype);
Pipe.prototype.constructor = Pipe;

Pipe.prototype.update = function() {
  // write your prefab's specific update code here
  
};

module.exports = Pipe;
},{}],5:[function(require,module,exports){








'use strict';

var Pipe = require('./pipe');

var PipeGroup = function(game, parent) {

  Phaser.Group.call(this, game, parent);

  this.topPipe = new Pipe(this.game, 0, 0, 0);
  this.bottomPipe = new Pipe(this.game, 0, 440, 1);
  this.add(this.topPipe);
  this.add(this.bottomPipe);
  this.hasScored = false;

  this.setAll('body.velocity.x', -200);
};

PipeGroup.prototype = Object.create(Phaser.Group.prototype);
PipeGroup.prototype.constructor = PipeGroup;

PipeGroup.prototype.update = function() {
  this.checkWorldBounds(); 
};

PipeGroup.prototype.checkWorldBounds = function() {
  if(!this.topPipe.inWorld) {
    this.exists = false;
  }
};


PipeGroup.prototype.reset = function(x, y) {
  this.topPipe.reset(0,0);
  this.bottomPipe.reset(0,440);
  this.x = x;
  this.y = y;
  this.setAll('body.velocity.x', -200);
  this.hasScored = false;
  this.exists = true;
};


PipeGroup.prototype.stop = function() {
  this.setAll('body.velocity.x', 0);
};

module.exports = PipeGroup;
},{"./pipe":4}],6:[function(require,module,exports){






'use strict';

var Scoreboard = function(game) {
  
  var gameover;
  
  Phaser.Group.call(this, game);
  gameover = this.create(this.game.width / 2, 100, 'gameover');
  gameover.anchor.setTo(0.5, 0.5);

  this.scoreboard = this.create(this.game.width / 2, 200, 'scoreboard');
  this.scoreboard.anchor.setTo(0.5, 0.5);
  
  this.scoreText = this.game.add.bitmapText(this.scoreboard.width, 180, 'flappyfont', '', 18);
  this.add(this.scoreText);
  
  this.bestText = this.game.add.bitmapText(this.scoreboard.width, 230, 'flappyfont', '', 18);
  this.add(this.bestText);

  // add our start button with a callback
  this.startButton = this.game.add.button(this.game.width/2, 300, 'startButton', this.startClick, this);
  this.startButton.anchor.setTo(0.5,0.5);

  this.add(this.startButton);

  this.y = this.game.height;
  this.x = 0;
  
};

Scoreboard.prototype = Object.create(Phaser.Group.prototype);
Scoreboard.prototype.constructor = Scoreboard;

Scoreboard.prototype.show = function(score) {
  var coin, bestScore;
  this.scoreText.setText(score.toString());
  if(!!localStorage) {
    bestScore = localStorage.getItem('bestScore');
    if(!bestScore || bestScore < score) {
      bestScore = score;
      localStorage.setItem('bestScore', bestScore);
    }
  } else {
    bestScore = 'N/A';
  }

  this.bestText.setText(bestScore.toString());

  if(score >= 10 && score < 20)
  {
    coin = this.game.add.sprite(-65 , 7, 'medals', 1);
  } else if(score >= 20) {
    coin = this.game.add.sprite(-65 , 7, 'medals', 0);
  }

  this.game.add.tween(this).to({y: 0}, 1000, Phaser.Easing.Bounce.Out, true);

  if (coin) {
    
    coin.anchor.setTo(0.5, 0.5);
    this.scoreboard.addChild(coin);
    
     // Emitters have a center point and a width/height, which extends from their center point to the left/right and up/down
    var emitter = this.game.add.emitter(coin.x, coin.y, 400);
    this.scoreboard.addChild(emitter);
    emitter.width = coin.width;
    emitter.height = coin.height;


    //  This emitter will have a width of 800px, so a particle can emit from anywhere in the range emitter.x += emitter.width / 2
    // emitter.width = 800;

    emitter.makeParticles('particle');

    // emitter.minParticleSpeed.set(0, 300);
    // emitter.maxParticleSpeed.set(0, 600);

    emitter.setRotation(-100, 100);
    emitter.setXSpeed(0,0);
    emitter.setYSpeed(0,0);
    emitter.minParticleScale = 0.25;
    emitter.maxParticleScale = 0.5;
    emitter.setAll('body.allowGravity', false);

    emitter.start(false, 1000, 1000);
    
  }
};

Scoreboard.prototype.startClick = function() {
  this.game.state.start('play');
};





Scoreboard.prototype.update = function() {
  // write your prefab's specific update code here
};

module.exports = Scoreboard;

},{}],7:[function(require,module,exports){




//_________________________________________________________BOOT STATE______________
'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    this.load.image('preloader', 'assets/preloader.gif');
  },


  create: function() {
    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;

},{}],8:[function(require,module,exports){









//_______________________________________________________________MENU STATE_________
'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {

  },
  create: function() {
      // Add backgorund image
      this.background = this.game.add.sprite(0,0, 'background');

    // add the ground sprite as a tile
    // and start scrolling in the negative x direction
    this.ground = this.game.add.tileSprite(0, 400, 335, 112, 'ground');
    this.ground.autoScroll(-200, 0);



    /** STEP 1 **/
    // create a group to put the title assets in 
    // so they can be manipulated as a whole
    this.titleGroup = this.game.add.group();

    /** STEP 2 **/
    // create the title sprite
    // and add it to the group
    this.title = this.game.add.sprite(0,0,'title');
    this.titleGroup.add(this.title);

    /** STEP 3 **/
    // create the papereta sprite 
    // and add it to the title group
    this.papereta = this.game.add.sprite(200, 5, 'papereta');
    this.titleGroup.add(this.papereta);

    /** STEP 4 **/
    // add an animation to the bird
    // and begin the animation (animation, frames, loop)
    this.papereta.animations.add('flap');
    this.papereta.animations.play('flap', 12, true);

    /** STEP 5 **/
    // Set the originating location of the group
    this.titleGroup.x = 30;
    this.titleGroup.y = 100;

    /** STEP 6 **/
    // create an oscillating animation tween for the group
    //this.game.add.tween(object).to(properties, duration, ease, autoStart, delay, repeat, yoyo);
    this.game.add.tween(this.titleGroup).to({y:115}, 350, Phaser.Easing.Linear.NONE, true, 0, 1000, true);



    // Add our start button with a callback
    // var button = this.game.add.button(x, y, key, callback, callbackContext);
    this.startButton = this.game.add.button(this.game.width/2, 460, 'startButton', this.startClick, this);
    // anchor is the position inside of the sprite that Phaser uses as it's point of origin
    this.startButton.anchor.setTo(0.5, 0.5);
    },

    startClick: function()
    {
      // Start button click handler
      // Start the 'play' state
      this.game.state.start('play');
    }
};

module.exports = Menu;

},{}],9:[function(require,module,exports){



//______________________________________________________________PLAY STATE________________

'use strict';
var Bird = require('../prefabs/bird');
var Ground = require('../prefabs/ground');
var Pipe = require('../prefabs/pipe');
var PipeGroup = require('../prefabs/pipeGroup');
var Scoreboard = require('../prefabs/scoreboard');


function Play() {
}
Play.prototype = {
  create: function() {
    
    // We will use Arcade physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    // Set global gravity for the game
    this.game.physics.arcade.gravity.y = 500;

    // add the background sprite
    this.background = this.game.add.sprite(0,0,'background');



    // Create a new bird object
    this.bird = new Bird(this.game, 100, this.game.height/2);
    // And add it to the game
    this.game.add.existing(this.bird);



    // Create a new Ground object
    // we need to pass in the required TileSprite parameters
    // which are (game, x, y, width, height, key)
    this.ground = new Ground(this.game, 0, 400, 335, 112);
    // And add it to the game
    this.game.add.existing(this.ground);

//_____________________________ESTIC EN AQUEST PUNT________________!!!!!!!________

    // add keyboard controls
    // we're telling the input object of our state to link a key on the keyboard to a local variable flapKey
    this.flapKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    // tell the flapKey object that when it is pressed, to call the flap() method on this.bird
    this.flapKey.onDown.add(this.bird.flap, this.bird);

    // add mouse/touch controls
    this.game.input.onDown.add(this.bird.flap, this.bird);


    // keep the spacebar from propogating up to the browser
    // say at the browser that the page won't scroll down when the spacebar is hit
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

// add keyboard controls
    
/* Això funciona malament però funciona.
    this.flapKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  
    this.flapKey.onDown.add(function(){this.bird.flap(this)}, this.bird);
    

    // add mouse/touch controls

    this.game.input.onDown.add(function(){this.bird.flap(this)}, this.bird);
    

    // keep the spacebar from propogating up to the browser
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

*/
    




    
  },
  update: function() {
    // Tells the Arcade physics system to check collisions
    // between this.bird and this.ground
    // If a collision is detected, the physics system reacts accordingly
    this.game.physics.arcade.collide(this.bird, this.ground)
       
  },
  shutdown: function() {
    this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
    this.bird.destroy();
    this.pipes.destroy();
    this.scoreboard.destroy();
  },
  startGame: function() {
    if(!this.bird.alive && !this.gameover) {
        this.bird.body.allowGravity = true;
        this.bird.alive = true;
        // add a timer
        this.pipeGenerator = this.game.time.events.loop(Phaser.Timer.SECOND * 1.25, this.generatePipes, this);
        this.pipeGenerator.timer.start();

        this.instructionGroup.destroy();
    }
  },
  checkScore: function(pipeGroup) {
    if(pipeGroup.exists && !pipeGroup.hasScored && pipeGroup.topPipe.world.x <= this.bird.world.x) {
        pipeGroup.hasScored = true;
        this.score++;
        this.scoreText.setText(this.score.toString());
        this.scoreSound.play();
    }
  },
  deathHandler: function(bird, enemy) {
    if(enemy instanceof Ground && !this.bird.onGround) {
        this.groundHitSound.play();
        this.scoreboard = new Scoreboard(this.game);
        this.game.add.existing(this.scoreboard);
        this.scoreboard.show(this.score);
        this.bird.onGround = true;
    } else if (enemy instanceof Pipe){
        this.pipeHitSound.play();
    }

    if(!this.gameover) {
        this.gameover = true;
        this.bird.kill();
        this.pipes.callAll('stop');
        this.pipeGenerator.timer.stop();
        this.ground.stopScroll();
    }
    
  },
  generatePipes: function() {
    var pipeY = this.game.rnd.integerInRange(-100, 100);
    var pipeGroup = this.pipes.getFirstExists(false);
    if(!pipeGroup) {
        pipeGroup = new PipeGroup(this.game, this.pipes);  
    }
    pipeGroup.reset(this.game.width, pipeY);
    

  }
};

module.exports = Play;

},{"../prefabs/bird":2,"../prefabs/ground":3,"../prefabs/pipe":4,"../prefabs/pipeGroup":5,"../prefabs/scoreboard":6}],10:[function(require,module,exports){









//____________________________________________________PRELOAD STATE_______________________
'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.asset = this.add.sprite(this.width/2,this.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    // Load the assets needed
      this.load.image('background', 'assets/background.png');
      this.load.image('ground', 'assets/ground.png');
      this.load.image('title', 'assets/title.png');
      this.load.image('startButton', 'assets/start-button.png');

      // Load an animation frames for our paperina, frameWidth, frameHeight, numberOfFrames
      this.load.spritesheet('papereta', 'assets/p_senyera.png', 34, 25, 5);
  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready)
    {
      this.game.state.start('menu');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;

},{}]},{},[1])