//-- Updated 2024.9.12 Finished.

// Initial basic entity class form sprite object.
class Entity extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key, type) {
      super(scene, x, y, key);
  
      this.scene = scene;
      this.scene.add.existing(this);
      this.scene.physics.world.enableBody(this, 0);
      this.setData("type", type);
      this.setData("isDead", false);
    }
  
    explode(canDestroy) {
      if (!this.getData("isDead")) {
        this.setTexture("sprExplosion");  
        this.play("sprExplosion"); 
        this.scene.sfx.explosions[Phaser.Math.Between(0, this.scene.sfx.explosions.length - 1)].play();
        if (this.shootTimer !== undefined) {
          if (this.shootTimer) {
            this.shootTimer.remove(false);
          }
        }
        this.setAngle(0);
        this.body.setVelocity(0, 0);
        this.on('animationcomplete', function() {
          if (canDestroy) {
            this.destroy();
          }
          else {
            this.setVisible(false);
          }
        }, this);
        this.setData("isDead", true);
      }
    }
  }
  
  // Initial player class from entity.
  class Player extends Entity {
    constructor(scene, x, y, key) {
      super(scene, x, y, key, "Player");
      this.setData("speed", 200);
      this.setData("isShooting", false);
      this.setData("timerShootDelay", 10);
      this.setData("timerShootTick", this.getData("timerShootDelay") - 1);
    }
  
    moveUp() {
      this.body.velocity.y = -this.getData("speed");
    }
    moveDown() {
      this.body.velocity.y = this.getData("speed");
    }
    moveLeft() {
      this.body.velocity.x = -this.getData("speed");
    }
    moveRight() {
      this.body.velocity.x = this.getData("speed");
    }
  
    onDestroy() {
      this.scene.time.addEvent({ 
        delay: 1000,
        callback: function() {
          const finalScore = this.scene.score;
          
          // When Player in OnDestroy, Swap to Scene GameOver Page with the final Score.
          this.scene.scene.start("SceneGameOver", { finalScore: finalScore });
        },
        callbackScope: this,
        loop: false
      });
    }
  
    update() {
      this.body.setVelocity(0, 0);
      this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);
      this.y = Phaser.Math.Clamp(this.y, 0, this.scene.game.config.height);
  
      if (this.getData("isShooting")) {
        if (this.getData("timerShootTick") < this.getData("timerShootDelay")) {
          this.setData("timerShootTick", this.getData("timerShootTick") + 1); 
        }
        else { 
          var laser = new PlayerLaser(this.scene, this.x, this.y);
          this.scene.playerLasers.add(laser);
          this.scene.sfx.laser.play();
          this.setData("timerShootTick", 0);
        }
      }
    }
  }
  
  // Player bullet.
  class PlayerLaser extends Entity {
    constructor(scene, x, y) {
      super(scene, x, y, "sprLaserPlayer");
      this.body.velocity.y = -200;
    }
  }
  
  // enemy bullet.
  class EnemyLaser extends Entity {
    constructor(scene, x, y) {
      super(scene, x, y, "sprLaserEnemy0");
      this.body.velocity.y = 200;
    }
  }
  
  // Enemy 1, Chaser Ship, Chasing the player when distance less than 320.
  class ChaserShip extends Entity {
    constructor(scene, x, y) {
      super(scene, x, y, "sprEnemy1", "ChaserShip");
      this.body.velocity.y = Phaser.Math.Between(70, 100);
      this.states = {
        MOVE_DOWN: "MOVE_DOWN",
        CHASE: "CHASE"
      };
      this.state = this.states.MOVE_DOWN;
    }
  
    update() {
      if (!this.getData("isDead") && this.scene.player) {
        if (Phaser.Math.Distance.Between(
          this.x,
          this.y,
          this.scene.player.x,
          this.scene.player.y
        ) < 320) {
          this.state = this.states.CHASE;
        }
  
        if (this.state == this.states.CHASE) {
          var dx = this.scene.player.x - this.x;
          var dy = this.scene.player.y - this.y;
          var angle = Math.atan2(dy, dx);
          var speed = 100;
          this.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
          );
  
          if (this.x < this.scene.player.x) {
            this.angle -= 5;
          }
          else {
            this.angle += 5;
          } 
        }
      }
    }
  }
  
  // Enemy 2, shoot the bullet with a duration in 1 second.
  class GunShip extends Entity {
    constructor(scene, x, y) {
      super(scene, x, y, "sprEnemy0", "GunShip");
      this.play("sprEnemy0");
      this.body.velocity.y = Phaser.Math.Between(70, 100);
      this.shootTimer = this.scene.time.addEvent({
        delay: 1000,
        callback: function() {
          var laser = new EnemyLaser(
            this.scene,
            this.x,
            this.y
          );
          laser.setScale(this.scaleX);
          this.scene.enemyLasers.add(laser);
        },
        callbackScope: this,
        loop: true
      });
    }
  
    onDestroy() {
      if (this.shootTimer !== undefined) {
        if (this.shootTimer) {
          this.shootTimer.remove(false);
        }
      }
    }
  }
  
  // Enemy 3, just move down, no chasing, no firing.
  class CarrierShip extends Entity {
    constructor(scene, x, y) {
      super(scene, x, y, "sprEnemy2", "CarrierShip");
      this.play("sprEnemy2");
  
      this.body.velocity.y = Phaser.Math.Between(70, 100);
    }
  }
  
  // Background base two pages.
  class ScrollingBackground {
    constructor(scene, key, velocityY) {
      this.scene = scene;
      this.key = key;
      this.velocityY = velocityY;
      this.layers = this.scene.add.group();
      this.createLayers();
    }
  
    createLayers() {
      for (var i = 0; i < 2; i++) {
        // creating two backgrounds will allow a continuous flow giving the illusion that they are moving.
        var layer = this.scene.add.sprite(0, 0, this.key);
        layer.y = (layer.displayHeight * i);
        var flipX = Phaser.Math.Between(0, 10) >= 5 ? -1 : 1;
        var flipY = Phaser.Math.Between(0, 10) >= 5 ? -1 : 1;
        layer.setScale(flipX * 2, flipY * 2);
        layer.setDepth(-5 - (i - 1));
        this.scene.physics.world.enableBody(layer, 0);
        layer.body.velocity.y = this.velocityY;
        this.layers.add(layer);
      }
    }
    
    update() {
      if (this.layers.getChildren()[0].y > 0) {
        for (var i = 0; i < this.layers.getChildren().length; i++) {
          var layer = this.layers.getChildren()[i];
          layer.y = (-layer.displayHeight) + (layer.displayHeight * i);
        }
      }
    }
  }

// -- Updated 2024.9.12 Finished.

class SceneLogin extends Phaser.Scene {
    constructor() {
      super({ key: "SceneLogin" });
    }
    // Load all button resource.
    preload() {
      
      this.load.image("sprBg0", "content/sprBg0.png");
      this.load.image("sprBg1", "content/sprBg1.png");
  
      this.load.image("sprBtnConnect", "content/sprBtnConnect.png");
      this.load.image("sprBtnConnectHover", "content/sprBtnConnectHover.png");
      this.load.image("sprBtnConnectDown", "content/sprBtnConnectDown.png");
  
      this.load.image("sprBtnPlay", "content/sprBtnPlay.png");
      this.load.image("sprBtnPlayHover", "content/sprBtnPlayHover.png");
      this.load.image("sprBtnPlayDown", "content/sprBtnPlayDown.png");
  
      this.load.image("sprBtnRestart", "content/sprBtnRestart.png");
      this.load.image("sprBtnRestartHover", "content/sprBtnRestartHover.png");
      this.load.image("sprBtnRestartDown", "content/sprBtnRestartDown.png");
  
      this.load.audio("sndBtnOver", "content/sndBtnOver.wav");
      this.load.audio("sndBtnDown", "content/sndBtnDown.wav");
    }
    // Create the UI and Interaction with Arconnect wallet.
    create() {
      // Initial button sounds for interaction.
      this.sfx = {
        btnOver: this.sound.add("sndBtnOver"),
        btnDown: this.sound.add("sndBtnDown")
      };
  
      // Add connect button as a sprite .
      this.btnConnect = this.add.sprite(
        this.game.config.width * 0.5,
        this.game.config.height * 0.6,
        "sprBtnConnect"
      );
  
      // Setting connect button as interactive.
      this.btnConnect.setInteractive();
  
      // Setting the texture and sound when interacting with button connect.
      this.btnConnect.on("pointerover", function() {
        this.btnConnect.setTexture("sprBtnConnectHover"); 
        this.sfx.btnOver.play(); 
      }, this);
  
      this.btnConnect.on("pointerout", function() {
        this.setTexture("sprBtnConnect");
      });
  
      this.btnConnect.on("pointerdown", function() {
        this.btnConnect.setTexture("sprBtnConnectDown");
        this.sfx.btnDown.play();
      }, this);
      
      // After Clicked the connect button, try open arconnect wallet extension
      // Then login the wallet and approve the Permission Request
      this.btnConnect.on('pointerup', async () => {
        this.btnConnect.setTexture('sprBtnConnect');
        
        try {
          if (window.arweaveWallet) {
              await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGNATURE", "SIGN_TRANSACTION"]);
              const address = await window.arweaveWallet.getActiveAddress();
              // After approved, swap to the Scene Play page with the user address.
              this.scene.start('ScenePlay',{ userAddress: address });
  
            } else {
              console.error("ArConnect is not installed.");
            }
      } catch (error) {
          console.error('Login Failed', error);
      }
    
      });
  
      // Add title text for this scene page.
      this.title = this.add.text(
        this.game.config.width * 0.5, 
        this.game.config.height * 0.3, 
        "AO GAMES", {
          fontFamily: 'monospace',
          fontSize: 35,
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center'
        });
      this.title.setOrigin(0.5);    
        
      // Add sub title text for this scene page.
      this.subtitle = this.add.text(
        this.game.config.width * 0.5, 
        this.game.config.height * 0.4, 
        "SPACE SHOOTER", {
          fontFamily: 'monospace',
          fontSize: 30,
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center'
        });
      this.subtitle.setOrigin(0.5);
  
      // Add background for this scene page.
      this.backgrounds = [];
      for (var i = 0; i < 5; i++) {
        var keys = ["sprBg0", "sprBg1"];
        var key = keys[Phaser.Math.Between(0, keys.length - 1)];
        var bg = new ScrollingBackground(this, key, i * 10);
        this.backgrounds.push(bg);
      }
    }
  
    update() {
      // Update the backgroud all the time.
      for (var i = 0; i < this.backgrounds.length; i++) {
        this.backgrounds[i].update();
      }
    }
  }
  
  // -- Updated 2024.9.12 Finished.
// -- Updated 2024.9.12 Finished.

class ScenePlay extends Phaser.Scene {
    constructor() {
      super({ key: "ScenePlay" });
    }
  
    preload() {
    }
  
    create(data) {
      // Get the user address from Scene Login Page.
      const addr = data.userAddress;
      const address = addr.slice(0,8);
  
      // Update the user address as a Global Phaser Variable.
      this.registry.set('userAddress', address);
  
      // Add player info text on the top-left of the Scene Play page.
      this.add.text(25, 25, `Player:`, { 
        fontSize: '17px', 
        color: '#FFFFFF' });
      this.add.text(100, 25, `${address}`, { fontSize: '17px', color: '#FFFFFF' });
  
      // Update the record of high score for this player.
      // Update the Total LeaderBoard.
      this.updateHighScoreOnAO(address);
      this.updateLeaderboardOnAO();
  
      // Initial button sounds for interaction.
      this.sfx = {
        btnOver: this.sound.add("sndBtnOver"),
        btnDown: this.sound.add("sndBtnDown")
      };
  
      // Add Play button as a sprite object.
      this.btnPlay = this.add.sprite(
        this.game.config.width * 0.5,
        this.game.config.height * 0.5,
        "sprBtnPlay"
      );
  
      // Setting play button as interactive.
      this.btnPlay.setInteractive();
  
      // Setting the texture and sound when interacting with button connect.
      this.btnPlay.on("pointerover", function() {
        this.btnPlay.setTexture("sprBtnPlayHover");
        this.sfx.btnOver.play();
      }, this);
  
      this.btnPlay.on("pointerout", function() {
        this.setTexture("sprBtnPlay");
      });
  
      this.btnPlay.on("pointerdown", function() {
        this.btnPlay.setTexture("sprBtnPlayDown");
        this.sfx.btnDown.play();
      }, this);
  
      // After Clicked the Play button, swap to Scene Game page with the user address.
      this.btnPlay.on("pointerup", function() {
        this.btnPlay.setTexture("sprBtnPlay");
        this.scene.start("SceneGame",{addr:addr});
      }, this);
  
      // Add background for this scene page.
      this.backgrounds = [];
      for (var i = 0; i < 5; i++) {
        var keys = ["sprBg0", "sprBg1"];
        var key = keys[Phaser.Math.Between(0, keys.length - 1)];
        var bg = new ScrollingBackground(this, key, i * 10);
        this.backgrounds.push(bg);
      }
    }
  
    update() {
      // Update the back ground.
      for (var i = 0; i < this.backgrounds.length; i++) {
        this.backgrounds[i].update();
      }
    }
  
    // An async function, for updating the leaderboard from an ao process.  
    async updateLeaderboardOnAO() {
  
      const process = 'Pq_u3ImiBUODJgH3XCm1dMvwL3AKU-8RIEhfLI3GXrk';
      const resp = await this.sendToAO(process,'QueryLeaderboard');
      const leaderboardData = JSON.parse(resp);
      // Show the leaderboard on the top-right of this page.
      this.add.text(300, 25, `TOP PLAYERS`, { fontSize: '20px', color: '#FFFFFF' });
      for (let i=0;i<leaderboardData.length;i++) {
        const item = leaderboardData[i];
        const info = item.key + ": " + item.value;
        this.add.text(300, 50+i*25, info, { 
        fontSize: '17px',
        color: '#FFFFFF' ,
        lineSpacing: 10 
        });
      };
    }
  
    // An async function for updating the user`s highest record from an ao process.
    async updateHighScoreOnAO(address){
      const process = 'Pq_u3ImiBUODJgH3XCm1dMvwL3AKU-8RIEhfLI3GXrk';
      const result = await this.sendToAO(process,'QueryScore',{'address':address});
      
      // Show the highest score on the top-left of this page.
      this.add.text(25, 50, `High Score:`, { fontSize: '17px', color: '#FFFFFF' });
      this.add.text(145, 50, `${result}`, { fontSize: '17px', color: '#FFFFFF' });
  
      // Update the highest score as a Phaser Global Variable.
      this.registry.set('HighScore', result);
    }
  
    // An async function for interacting with AO process with @permaweb/aoconnect/dryrun function.
    async sendToAO(process, action, data) {
      let result;
      try {
        result = await window.dryrun({
          process,
          data: JSON.stringify(data),
          tags: [{ name: 'Action', value: action }]
        });
      } catch (error) {
        console.log('getDataFromAO --> ERR:', error);
        return '';
      }
      let resp = result.Messages[0].Data;
      // console.log(resp);
      return resp;
    }
  }
  
class SceneGame extends Phaser.Scene {
    constructor() {
      super({ key: "SceneGame" });
    }
    
    // Preload some resource for the Scene Game page.
    preload() {
      this.load.spritesheet("sprExplosion", "content/sprExplosion.png", {
        frameWidth: 32,
        frameHeight: 32
      });
      this.load.spritesheet("sprEnemy0", "content/sprEnemy0.png", {
        frameWidth: 16,
        frameHeight: 16
      });
      this.load.image("sprEnemy1", "content/sprEnemy1.png");
      this.load.spritesheet("sprEnemy2", "content/sprEnemy2.png", {
        frameWidth: 16,
        frameHeight: 16
      });
      this.load.image("sprLaserEnemy0", "content/sprLaserEnemy0.png");
      this.load.image("sprLaserPlayer", "content/sprLaserPlayer.png");
      this.load.spritesheet("sprPlayer", "content/sprPlayer.png", {
        frameWidth: 16,
        frameHeight: 16
      });
      this.load.audio("sndExplode0", "content/sndExplode0.wav");
      this.load.audio("sndExplode1", "content/sndExplode1.wav");
      this.load.audio("sndLaser", "content/sndLaser.wav");
    }
  
    create(data) {
      // Get the user address.
      const useraddr = data.addr;
      const address = useraddr.slice(0,8);
  
      // Show Player Info on the top-left of this Page.
      this.add.text(25, 25, `Player:`, { fontSize: '17px', color: '#FFFFFF' });
      this.add.text(100, 25, `${address}`, { fontSize: '17px', color: '#FFFFFF' });
      
      // Record the score and the level for the player in this game.
      this.score = 0;
      this.scoreText = this.add.text(25, 50, 'Scores: 0', { fontSize: '17px', color: '#FFFFFF' });
      this.level = 0;
      this.levelText = this.add.text(25, 75, 'Levels: 0', { fontSize: '17px', color: '#FFFFFF' });
  
      // Initail the enemy spawn rate as 1 enemy per second.
      // Update the rate with score and level up.
      this.enemySpawnRate = 1000; 
      this.initializeEnemySpawner();
  
      // Setting the level Mile stones for Player Scores.
      this.levelMilestones = [
        100, 200, 300, 400, 600, 
        800, 1000, 1500, 2000, 2500, 
        3000, 3500, 4000, 4500, 5000, 
        6000, 7000, 8000, 9000, 10000, 
        11000, 12000, 13000, 14000, 15000, 
        16000, 17000, 18000, 19000, 20000, 
        22000, 24000, 26000, 28000, 30000, 
        33000, 36000, 39000, 42000, 45000, 
        48000, 51000, 54000, 57000, 60000, 
        70000, 80000, 90000, 99999
      ]; 
  
      // Create all animations for enemies and player.
      this.anims.create({
        key: "sprEnemy0",
        frames: this.anims.generateFrameNumbers("sprEnemy0"),
        frameRate: 20,
        repeat: -1
      });
      this.anims.create({
        key: "sprEnemy2",
        frames: this.anims.generateFrameNumbers("sprEnemy2"),
        frameRate: 20,
        repeat: -1
      });
      this.anims.create({
        key: "sprExplosion",
        frames: this.anims.generateFrameNumbers("sprExplosion"),
        frameRate: 20,
        repeat: 0
      });
      this.anims.create({
        key: "sprPlayer",
        frames: this.anims.generateFrameNumbers("sprPlayer"),
        frameRate: 20,
        repeat: -1
      });
  
      // Sound
      this.sfx = {
        explosions: [
          this.sound.add("sndExplode0"),
          this.sound.add("sndExplode1")
        ],
        laser: this.sound.add("sndLaser")
      };
  
      // Background
      this.backgrounds = [];
      for (var i = 0; i < 5; i++) {
        var bg = new ScrollingBackground(this, "sprBg0", i * 10);
        this.backgrounds.push(bg);
      }
  
      // Add initial Player object.
      this.player = new Player(
        this,
        this.game.config.width * 0.5,
        this.game.config.height * 0.8,
        "sprPlayer"
      );
  
      // Add enemies, enemy bullets, and player bullets.
      this.enemies = this.add.group();
      this.enemyLasers = this.add.group();
      this.playerLasers = this.add.group();
  
      // Add listenning for the keyboard input.
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
      this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
      // add a collider between player bullet and enemy for judge as enemy destroyed.
      // Enemy destroy, player bullet destroy.
      // Player score plus, and update the score text.
      this.physics.add.collider(this.playerLasers, this.enemies, function(playerLaser, enemy) {
        if (enemy) {
          if (enemy.onDestroy !== undefined) {
            enemy.onDestroy();
          }
          enemy.explode(true);
          playerLaser.destroy();
  
          this.score += 100;
          this.scoreText.setText('Score: ' + this.score);
        }
      }, null, this);
  
      // Add an overlap for player and enemy for judge as player and enemey destroyed at same time.
      // Player destroy and game over.
      this.physics.add.overlap(this.player, this.enemies, function(player, enemy) {
        if (!player.getData("isDead") &&
            !enemy.getData("isDead")) {
          player.explode(false);
          player.onDestroy();
          enemy.explode(true);
        }
      });
  
      // Add an overlap for player and enemy bullet for judge as player destroyed and game over.
      this.physics.add.overlap(this.player, this.enemyLasers, function(player, laser) {
        if (!player.getData("isDead") &&
            !laser.getData("isDead")) {
          player.explode(false);
          player.onDestroy();
          laser.destroy();
        }
      });
    }
  
    // User the enemy spwan rate for spawning enemy.
    initializeEnemySpawner() {
      if (this.enemySpawner) {
         this.enemySpawner.remove(false);
      }
  
      this.enemySpawner = this.time.addEvent({
         delay: this.enemySpawnRate,
         callback: this.spawnEnemy,
         callbackScope: this,
         loop: true
      });
    }
  
    // Spawn enemy and adding to the enemies group.
    spawnEnemy() {
      var enemy = null;
      if (Phaser.Math.Between(0, 10) >= 3) {
        enemy = new GunShip(this, Phaser.Math.Between(0, this.game.config.width), 0);
      } else if (Phaser.Math.Between(0, 10) >= 5 && this.getEnemiesByType("ChaserShip").length < 5) {
        enemy = new ChaserShip(this, Phaser.Math.Between(0, this.game.config.width), 0);
      } else {
        enemy = new CarrierShip(this, Phaser.Math.Between(0, this.game.config.width), 0);
      }
  
      if (enemy !== null) {
        // Inital the random scale and speed.
        enemy.setScale(Phaser.Math.Between(10, 20) * 0.1);
        enemy.initialSpeed = Phaser.Math.Between(70, 100);  
        this.enemies.add(enemy);
      }
    }
  
    // Update the difficulty with level up.
    updateDifficulty() {
      if (this.level <= 10) {
        this.enemySpawnRate = 1000 / (1 + 0.1 * this.level); 
      } else if (this.level > 10 && this.level <= 20) {
        this.enemySpawnRate = 500 / (1 + this.level*0.05); 
      } else { 
        this.enemySpawnRate = 250;
      }
  
      // Update the enemy spawner with new level.
      this.initializeEnemySpawner();
  
      this.enemies.getChildren().forEach(enemy => {
        // Update the enemy speed with new level.
        enemy.body.velocity.y = enemy.initialSpeed * (1 + this.level * 0.015); 
      });
    }
  
    // Judge the enemy type for spawning different enemies.
    getEnemiesByType(type) {
      var arr = [];
      for (var i = 0; i < this.enemies.getChildren().length; i++) {
        var enemy = this.enemies.getChildren()[i];
        if (enemy.getData("type") == type) {
          arr.push(enemy);
        }
      }
      return arr;
    }
  
    update() {
  
      // Update the Keyboard and Player move function.
      if (!this.player.getData("isDead")) {
        this.player.update();
  
        if (this.keyW.isDown || this.keyUp.isDown) {
          this.player.moveUp();}
  
        else if (this.keyS.isDown || this.keyDown.isDown) {
          this.player.moveDown();}
  
        if (this.keyA.isDown || this.keyLeft.isDown) {
          this.player.moveLeft();}
  
        else if (this.keyD.isDown || this.keyRight.isDown) {
          this.player.moveRight();}
  
        if (this.keySpace.isDown) {
          this.player.setData("isShooting", true);}
        else {
          this.player.setData("timerShootTick", this.player.getData("timerShootDelay") - 1);
          this.player.setData("isShooting", false)}
      }
  
      // Update the Enemies Logic.
      for (var i = 0; i < this.enemies.getChildren().length; i++) {
        var enemy = this.enemies.getChildren()[i];
        enemy.update()
        if (enemy.x < -enemy.displayWidth ||
          enemy.x > this.game.config.width + enemy.displayWidth ||
          enemy.y < -enemy.displayHeight * 4 ||
          enemy.y > this.game.config.height + enemy.displayHeight) {
          if (enemy) {
            if (enemy.onDestroy !== undefined) {
              enemy.onDestroy();
            }
            enemy.destroy();
          }
        }
      }
  
      // Update the enemy bullets Logic.
      for (var i = 0; i < this.enemyLasers.getChildren().length; i++) {
        var laser = this.enemyLasers.getChildren()[i];
        laser.update();
        if (laser.x < -laser.displayWidth ||
          laser.x > this.game.config.width + laser.displayWidth ||
          laser.y < -laser.displayHeight * 4 ||
          laser.y > this.game.config.height + laser.displayHeight) {
          if (laser) {
            laser.destroy();
          }
        }
      }
  
      // Update the Player Bullets Logic.
      for (var i = 0; i < this.playerLasers.getChildren().length; i++) {
        var laser = this.playerLasers.getChildren()[i];
        laser.update();
        if (laser.x < -laser.displayWidth ||
          laser.x > this.game.config.width + laser.displayWidth ||
          laser.y < -laser.displayHeight * 4 ||
          laser.y > this.game.config.height + laser.displayHeight) {
          if (laser) {
            laser.destroy();
          }
        }
      }
  
      // Update the level and difficulty when score is over level milestones.
      if (this.score >= this.levelMilestones[this.level]) {
        this.level++;
        if (this.level == 49){this.levelText.setText('Level: ' + 'Max');}
        this.levelText.setText('Level: ' + this.level);
        this.updateDifficulty();
      }
  
      // Update the enemy spawn rate when level up.
      if (this.level <= 5) {
        this.enemySpawnRate = (1000 - 100 * this.level);} 
      else if (this.level <= 15) {
        this.enemySpawnRate = (500 - 20 * this.level);} 
      else if (this.level > 15) {
        this.enemySpawnRate = 200;
      }
     
      // Update the background.
      for (var i = 0; i < this.backgrounds.length; i++) {
        this.backgrounds[i].update();
      }
    }
  }


// -- Updated 2024.9.12 Finished.

class SceneGameOver extends Phaser.Scene {
    constructor() {
      super({ key: "SceneGameOver" });
    }
  
    init(data) {
      //Get the final score from Scene Game Page.
      this.finalScore = data.finalScore; 
    }
    create() {
      // Add the restart button as sprite object.
      this.btnRestart = this.add.sprite(
        this.game.config.width * 0.5,
        this.game.config.height * 0.6,
        "sprBtnRestart"
      );
  
      // Set restart button as interactive.
      this.btnRestart.setInteractive();
  
      // Set the texture for the button.
      this.btnRestart.on("pointerover", function() {
        this.btnRestart.setTexture("sprBtnRestartHover");
        this.sfx.btnOver.play();
      }, this);
  
      this.btnRestart.on("pointerout", function() {
        this.setTexture("sprBtnRestart");
      });
  
      this.btnRestart.on("pointerdown", function() {
        this.btnRestart.setTexture("sprBtnRestartDown");
        this.sfx.btnDown.play();
      }, this);
  
       // Open the Scene Game page directly and start a new game.
       this.btnRestart.on("pointerup", function() {
        this.btnRestart.setTexture("sprBtnRestart");
        this.scene.start("ScenePlay");
      }, this);
  
      // Judge the highest Score and the current score.
      const currentScore = this.finalScore ;
      const highestScore = this.registry.get('HighScore');
      const addr = this.registry.get('userAddress');
  
      // Add the end information for different scores.
      const messageText = this.add.text(
        this.game.config.width * 0.5, 
        this.game.config.height * 0.3, 
        '', { 
          fontSize: '32px', 
          fill: '#fff' }).setOrigin(0.5);
      
      // New record for highest scores.
      if (currentScore > highestScore) {
        messageText.setText('Congratulations!\n  New Record!');
        
        // Update the new record to ao Process.
        this.UpdateScoreOnAO(addr,currentScore).then(() => {
          console.log("success");
          }).catch(error => {
              console.log("failed", error);
          });
  
      } else {
          // No new record in this game.
          messageText.setText('Challenge Again.\n   Good Luck!');
      }
  
      // Sound
      this.sfx = {
        btnOver: this.sound.add("sndBtnOver"),
        btnDown: this.sound.add("sndBtnDown")
      };
  
      // Background
      this.backgrounds = [];
      for (var i = 0; i < 5; i++) {
        var keys = ["sprBg0", "sprBg1"];
        var key = keys[Phaser.Math.Between(0, keys.length - 1)];
        var bg = new ScrollingBackground(this, key, i * 10);
        this.backgrounds.push(bg);
      }
    }
  
    // An async function for sending message to AO process with message and createDataItemSigner functions.
    async UpdateScoreOnAO(addr,score) {
  
      const process = 'Pq_u3ImiBUODJgH3XCm1dMvwL3AKU-8RIEhfLI3GXrk';
      const action = 'UpdateScore';
      const data = {"address": addr,"score":String(score)};
      const dataString = JSON.stringify(data);
  
      //Send message to ao process with signature.
      try {
        await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGNATURE", "SIGN_TRANSACTION"]);
        const signer = window.createDataItemSigner(window.arweaveWallet);
        await window.message({
          process: process,
          tags: [
            { name: "Action", value: action },
          ],
          signer: signer,
          data: dataString,
        })
        .then(response => {
          console.log("Message sent successfully:", response);
        })
        .catch(error => {
          console.error("Error sending message:", error);
        });
      } catch (error) {
        console.error("ArConnect operation failed:", error);
      }
    }
  
    // Update background.
    update() {
      for (var i = 0; i < this.backgrounds.length; i++) {
        this.backgrounds[i].update();
      }
    }
  }
  

var config = {
    type: Phaser.WEBGL,
    width: 480,
    height: 640,
    backgroundColor: "black",
    parent: "game-container",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 }
      }
    },
    scene: [
      SceneLogin,
      ScenePlay,
      SceneGame,
      SceneGameOver
    ],
    pixelArt: true,
    roundPixels: true
  };
  
var game = new Phaser.Game(config);