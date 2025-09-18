const perguntas = {
  1: {
    pergunta: "Quem foi o primeiro presidente dos EUA?",
    opcoes: ["Lincoln", "Washington", "Jefferson", "Roosevelt"],
    correta: 1
  },
  2: {
    pergunta: "Em que ano terminou a Segunda Guerra Mundial?",
    opcoes: ["1939", "1945", "1950", "1941"],
    correta: 1
  },
  3: {
    pergunta: "Qual país colonizou os EUA?",
    opcoes: ["França", "Espanha", "Holanda", "Inglaterra"],
    correta: 3
  }
};

let vidas = 3;
let faseAtual = 1;
let perguntaRespondida = false;

class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  preload() {
    this.load.image('bg1', 'assets/background1.png');
    this.load.image('bg2', 'assets/background2.png');
    this.load.image('bg3', 'assets/background3.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('plataforma', 'assets/plataforma.png');
    this.load.image('restart', 'assets/restart.png');
    this.load.image('questionario', 'assets/questionario.png');
  }

  create() {
    this.bg = this.add.image(600, 250, `bg${faseAtual}`);
    this.bg.setDepth(-1);

    this.perguntaRespondida = false;

    this.plataformas = this.physics.add.staticGroup();
    this.plataformas.create(600, 490, 'plataforma').setScale(6, 1).refreshBody();
    this.plataformas.create(400, 400, 'plataforma');
    this.plataformas.create(700, 320, 'plataforma');
    this.plataformas.create(1000, 250, 'plataforma');

    this.player = this.physics.add.sprite(100, 300, 'player').setScale(0.5);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.plataformas);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    
    this.blocoPergunta = this.physics.add.staticImage(1000, 200, 'questionario').setScale(0.5);
    this.physics.add.overlap(this.player, this.blocoPergunta, () => {
      this.pertoDoBloco = true;
    }, null, this);

    this.pertoDoBloco = false;

    this.vidasText = this.add.text(20, 20, `Vidas: ${vidas}`, {
      fontSize: '22px',
      fill: '#fff'
    });
  }

  update() {
    if (!this.player.active) return;

    this.player.setVelocityX(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    }

   
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.body.blocked.down) {
      this.player.setVelocityY(-300);
    }

   
    if (this.pertoDoBloco && Phaser.Input.Keyboard.JustDown(this.enterKey) && !perguntaRespondida) {
      this.scene.pause();
      this.scene.launch('QuizScene');
    }

    this.bg.setTexture(`bg${faseAtual}`);
  }
}

class QuizScene extends Phaser.Scene {
  constructor() {
    super('QuizScene');
  }

  create() {
    const perguntaData = perguntas[faseAtual];

    this.add.rectangle(600, 250, 800, 300, 0x000000, 0.8);
    this.add.text(220, 120, perguntaData.pergunta, { fontSize: '26px', fill: '#fff' });

    perguntaData.opcoes.forEach((op, i) => {
      const y = 180 + i * 50;
      const box = this.add.rectangle(250, y, 700, 40, 0x444444).setOrigin(0);
      const txt = this.add.text(270, y + 8, `${i + 1}. ${op}`, { fontSize: '20px', fill: '#fff' });

      box.setInteractive();
      box.on('pointerdown', () => this.verificarResposta(i));
    });
  }

  verificarResposta(indice) {
    if (indice === perguntas[faseAtual].correta) {
      faseAtual++;
      perguntaRespondida = true;
      if (faseAtual > 3) {
        alert("Parabéns! Você venceu!");
        vidas = 3;
        faseAtual = 1;
      }
      this.scene.stop();
      this.scene.resume('PlayScene');
    } else {
      vidas--;
      if (vidas <= 0) {
        this.scene.stop('PlayScene');
        this.scene.start('GameOverScene');
      } else {
        this.scene.stop();
        this.scene.resume('PlayScene');
      }
    }
  }
}

class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    this.add.image(600, 250, 'restart');

    this.input.keyboard.on('keydown-R', () => {
      vidas = 3;
      faseAtual = 1;
      perguntaRespondida = false;
      this.scene.start('PlayScene');
    });

    this.add.text(430, 460, "Pressione 'R' para recomeçar", {
      fontSize: '22px',
      fill: '#fff'
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 500,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: [PlayScene, QuizScene, GameOverScene]
};

const game = new Phaser.Game(config);
