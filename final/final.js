var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },

    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },

    scene: {
        preload: init,
        create: rendering,
        update: update
    }
};

var game = new Phaser.Game(config);
var timer = 0;
var timerText;
var score = 0;
var scoreText;
var lastFired = 0;
var g = 0;


function init() {
    this.load.image('bg', 'assets/farback.gif')
    this.load.image('ship', 'assets/sprPlayer-1.png.png')
    this.load.audio('explode', 'assets/sndExplode.wav')
    this.load.spritesheet('enemy1', 'assets/sprEnemy0.png', { frameWidth: 8, frameHeight: 8, })
    this.load.image('bullets', 'assets/beep.png')
    this.load.image('boomboom', 'assets/explosion2.png')
    this.load.spritesheet('coin', 'assets/Full Coins.png', {
        frameWidth: 16,
        frameHeight: 16
    })
}


function rendering() {
   bg = this.add.image(400,300,'bg')
    player = this.physics.add.image(400, 500, 'ship').setScale(3);

    scoreText = this.add.text(16, 560, 'Score: 0', {
        fontSize: "32px",
        fill: 'white'
    });

    timerText = this.add.text(550, 550, 'Time: 0', {
        fontSize: "32px",
        fill: 'white'
    }); 

    var sound = this.sound.add('explode')
    

    this.anims.create({
        key: 'coin',
        frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 7 }),
        frameRate: 5,
        repeat: -1
    }),
    this.anims.create({
        key: 'enemy',
        frames: this.anims.generateFrameNumbers('enemy1', { start: 0, end: 2 }),
        frameRate: 5,
        repeat: -1
    })


    enemy = this.physics.add.sprite(Phaser.Math.Between(100, 800), Phaser.Math.Between(100, 200), 'enemy1').setScale(4);

    timedEvent = this.time.addEvent({
        delay: 1000,
        callback: onEvent,
        callbackScope: this,
        loop: true
    });


    function onEvent() {
        timer++;
        timerText.setText('Time:' + timer);
        enemy = this.physics.add.group();
        enemy = this.physics.add.sprite(Phaser.Math.Between(100, 800), 100, 'enemy1').setScale(4);
        this.physics.moveToObject(enemy, player, Phaser.Math.Between(40, 200));

        coins = this.physics.add.group();
        coins = this.physics.add.sprite(Phaser.Math.Between(100, 800), 100, 'coin').setVelocityY(160).setVelocityX(Phaser.Math.Between(-200, 200)).setScale(1.5);
        coins.anims.play('coin');

        this.physics.add.overlap(player, coins, collectCoin, null, this);
        this.physics.add.collider(enemy, player, hitPlayer, null, this);
        this.physics.add.collider(enemy, bullets, hitEnemy, null, this);
        
        if (g === 1) {
            timedEvent.remove(true)
        }
    }


    bullets = this.physics.add.group({
        runChildrenUpdate: true
    });

    this.physics.moveToObject(enemy, player, Phaser.Math.Between(100, 200));
    this.physics.add.collider(enemy, player, hitPlayer, null, this);
    this.physics.add.collider(enemy, bullets, hitEnemy, null, this);

    particles = this.add.particles('boomboom');


    function collectCoin(player, coins) {
        coins.disableBody(true, true);
        score += 200;
        scoreText.setText('Score: ' + score);
    }


    function hitEnemy(enemy, bullets) {
        sound.play()
        score += 100;
        scoreText.setText("Score: " + score);
        enemy.disableBody(true, true);
        bullets.disableBody(true, true);

        particles.createEmitter({
            alpha: { start: 1, end: 0 },
            scale: { start: .05, end: .05 },
            tint: { start: 0xff945e, end: 0xff945e },
            speed: 50,
            accelerationY: -50,
            angle: { min: -85, max: -95 },
            rotate: { min: -180, max: 180 },
            lifespan: { min: 1000, max: 1100 },
            maxParticles: 5,
            x: enemy.x,
            y: enemy.y,
        });
    }


    function hitPlayer(player, enemy) {
        sound.play()
        timerText.setText("Time: 0")
        scoreText.setText("Score: " + score);
        this.physics.pause();
        player.disableBody(true, true);
        enemy.disableBody(true, true);

        particles.createEmitter({
            alpha: { start: 1, end: 0 },
            scale: { start: .05, end: .05 },
            tint: { start: 0xff945e, end: 0xff945e },
            speed: 50,
            accelerationY: -50,
            angle: { min: -85, max: -95 },
            rotate: { min: -180, max: 180 },
            lifespan: { min: 1000, max: 1100 },
            maxParticles: 5,
            x: player.x,
            y: player.y,

        });
        g++;
    }


    cursors = this.input.keyboard.createCursorKeys();
}


function update(time) {

    enemy.anims.play('enemy');

    this.physics.world.wrap(player, 48)

    if (cursors.left.isDown) {
        player.setVelocityX(-220);
    } else if (cursors.right.isDown) {
        player.setVelocityX(220);
    } else if (cursors.down.isDown) {
        player.setVelocityY(220);
    } else if (cursors.up.isDown) {
        player.setVelocityY(-220);
    } else {
        player.setVelocity(0);
    }

    if (cursors.space.isDown && time > lastFired) {
        bullets.create(player.x, player.y, 'bullets').setScale(.030);
        bullets.setVelocityY(-260)
        lastFired = time + 500;
    }
}

