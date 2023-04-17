class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: 'Level1' })
  }

  preload() {
    this.load.image('background', 'assets/background.png')
    this.load.spritesheet('blob', 'assets/blob.png', {
      frameWidth: 24,
      frameHeight: 24,
    })
    this.load.image('portal', 'assets/portal.png')
    this.load.image('laser_blue_vert', 'assets/laser_blue_vert.png')
    this.load.image('laser_blue_horiz', 'assets/laser_blue_horiz.png')
    this.load.image('laser_violet_vert', 'assets/laser_violet_vert.png')
    this.load.image('laser_violet_horiz', 'assets/laser_violet_horiz.png')
    this.load.image('bomb', 'assets/bomb.png')
    this.load.image('explosion', 'assets/explosion.png')
  }

  create() {
    // Add the background image
    this.add.image(350, 300, 'background').setScale(1.6, 1.325)

    // Add the portal image
    this.portal = this.physics.add
      .image(350, 50, 'portal')
      .setImmovable(true)
      .setOrigin(0.5)

    // Create an invisible sprite that matches the size and position of the portal image
    this.portalCollider = this.physics.add
      .sprite(350, 50, null)
      .setImmovable(true)
      .setVisible(false)
    this.portalCollider.setSize(this.portal.width, this.portal.height)
    this.portalCollider.setPosition(this.portal.x, this.portal.y)

    // Create the player sprite
    this.player = this.physics.add.sprite(350, 550, 'blob')

    // Set the player's drag to control its movement
    this.player.setDrag(1000)

    // Set world bounds to the dimensions of the background image
    this.physics.world.setBounds(8, 8, 682, 582)

    // Set player body to collide with the world bounds
    this.player.setCollideWorldBounds(true)

    // Add a collider for the portal image
    this.physics.add.collider(this.player, this.portalCollider, () => {
      this.player.setVelocity(0)
      this.player.active = false // set player to inactive so it doesn't move anymore
      this.player.setPosition(this.portal.x, this.portal.y)
      this.player.setScale(0.5) // set the scale of the blob to half of its original size
      this.time.delayedCall(250, () => {
        this.player.setVisible(false)
        this.spacePressed = false
        window.alert('Level Cleared')
        this.scene.restart()
      })
    })

    // Lasers
    this.lasers = this.physics.add.staticGroup()
    this.lasers.create(550, 250, 'laser_blue_vert')
    this.lasers.create(625, 240, 'laser_violet_horiz')

    this.lasers.create(485, 175, 'laser_blue_horiz')

    this.lasers.create(150, 250, 'laser_violet_vert')
    this.lasers.create(75, 240, 'laser_blue_horiz')

    this.lasers.create(350, 300, 'laser_violet_vert')

    this.lasers.create(240, 500, 'laser_violet_horiz')
    this.lasers.create(460, 500, 'laser_blue_horiz')

    this.lasers.create(350, 100, 'laser_blue_horiz')

    this.lasers.create(215, 175, 'laser_blue_horiz')

    this.lasers.create(285, 375, 'laser_blue_horiz')
    this.lasers.create(415, 375, 'laser_violet_horiz')

    this.physics.add.collider(this.player, this.lasers, () => {
      window.alert('Game Over')
      this.spacePressed = false
      this.scene.restart()
    })

    // Add a timer event to blink the laser color red every 3 seconds
    this.time.addEvent({
      delay: 800,
      loop: true,
      callback: () => {
        // Get all the laser sprites
        const lasers = this.lasers.getChildren()

        // Loop through each laser sprite and change its tint color to red
        lasers.forEach((laser) => {
          laser.setTint(0xff0000)
        })

        // Add a short delay before changing the tint color back to the original
        this.time.delayedCall(200, () => {
          // Loop through each laser sprite and change its tint color back to the original
          lasers.forEach((laser) => {
            laser.clearTint()
          })
        })
      },
    })

    // Create bombs
    this.bombs = this.physics.add.staticGroup()
    this.bomb1 = this.bombs.create(75, 300, 'bomb')
    this.bomb2 = this.bombs.create(625, 300, 'bomb')

    // Make bombs blink
    this.tweens.add({
      targets: [this.bomb1, this.bomb2],
      alpha: 0,
      ease: 'Linear',
      duration: 500,
      repeat: -1,
      yoyo: true,
    })

    // Instructions
    this.instructionText1 = this.add.text(
      85,
      125,
      'Help Blob to get out of the maze using the portal\n before timer runs out...',
      {
        fontSize: '18px',
        fill: '#a6E3A1',
        align: 'center',
      }
    )
    this.instructionText2 = this.add
      .text(350, 300, 'Press SPACE to start the game!', {
        fontSize: '32px',
        fill: '#9d00ff',
        align: 'center',
      })
      .setFontStyle('bold')
    this.instructionText2.setOrigin(0.5)

    // Create explosion sprite
    this.explosion1 = this.add.image(this.bomb1.x, this.bomb1.y, 'explosion')
    this.explosion2 = this.add.image(this.bomb2.x, this.bomb2.y, 'explosion')

    // Set the anchor point to the center of the sprite
    this.explosion1.setOrigin(0.5)
    this.explosion2.setOrigin(0.5)

    // Hide the sprite initially
    this.explosion1.setVisible(false)
    this.explosion2.setVisible(false)

    // Time bar
    this.timeLimit = 70
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    })
    this.timeLimit--
    this.barFillAmount = this.timeLimit / 60
    this.bar = this.add.graphics()
    this.bar.fillStyle(0x39ff14, 1)
    this.bar.fillRect(0, 0, this.barFillAmount * 200, 20)
    this.bar.x = 10
    this.bar.y = 10
    this.abilityDurationText = this.add
      .text(this.bar.x + 23, this.bar.y, '💣 Time Left 💣', {
        fontSize: '20px',
        fill: '#fd1c03',
        align: 'center',
      })
      .setFontStyle('bold')

    // Explosion
    this.timer = this.time.addEvent({
      delay: 1000, // in ms
      callback: () => {
        this.bomb1.destroy()
        this.bomb2.destroy()

        // Show the explosion sprite
        this.explosion1.setVisible(true)
        this.explosion2.setVisible(true)

        // Trigger the alert after the explosion animation finishes
        this.time.delayedCall(2, () => {
          window.alert('Game Over')
          this.spacePressed = false
          this.scene.restart()
        })
      },
      loop: true,
      paused: true,
    })
  }

  update() {
    // Player Movements
    const cursors = this.input.keyboard.createCursorKeys()

    if (this.player.active && this.spacePressed) {
      if (cursors.left.isDown) {
        this.player.setVelocityX(-200)
      } else if (cursors.right.isDown) {
        this.player.setVelocityX(200)
      } else {
        this.player.setVelocityX(0)
      }

      if (cursors.up.isDown) {
        this.player.setVelocityY(-200)
      } else if (cursors.down.isDown) {
        this.player.setVelocityY(200)
      } else {
        this.player.setVelocityY(0)
      }
    }

    // Check if space bar is pressed
    //var barFillAmount = 1
    if (
      this.input.keyboard.checkDown(this.input.keyboard.addKey('SPACE'), 500)
    ) {
      this.spacePressed = true

      // Hide the instructions
      this.instructionText1.setVisible(false)
      this.instructionText2.setVisible(false)

      // Pause the bomb timer
      this.timer.paused = true
    }

    // Decrease the bar fill amount if space bar is pressed
    if (this.spacePressed) {
      this.barFillAmount -= 0.005
      this.bar.clear()
      this.bar.fillStyle(0x39ff14, 1)
      this.bar.fillRect(0, 0, this.barFillAmount * 200, 20)

      // Check if the bar is empty
      if (this.barFillAmount <= 0) {
        // Start the bomb timer
        this.timer.paused = false
        this.barFillAmount = 0
      }
    }
  }
}

this.game.scene.add('Level1', Level1, true)
