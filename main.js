
var Swipe = require('phaser-swipe');

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    backgroundColor: 0x444444,
};

//Setting up swiping feature
var body = document.getElementsByTagName('html');

var game = new Phaser.Game(config);
var swipe = new Swipe(game.scene, config);

var rectangle;

var snake;
var graphics;
var counter;
var cursors;
var coin;
var coinRectangle;


swipe.on('swipe', function(swipe, gameObject, lastPointer){
  alert("Swipe detected!");
}), scope;
function preload ()
{

}

function create ()
{
  this.swipe = new Swipe(game);
  rectangle = new Phaser.Geom.Rectangle(700, 400, 30, 30, 0x000000);
  coinRectangle = new Phaser.Geom.Rectangle(400, 300, 20, 20, 0x00FF00);
  cursors = this.input.keyboard.createCursorKeys();
  graphics = this.add.graphics();

  counter = 0;

  snake = {
    head : rectangle,
    direction : 'up',
    bodyX: [700, 700],
    bodyY: [rectangle.y + 40, rectangle.y + 80],
    delta : 40
  }

  coin = {
    shape : coinRectangle
  }

  for(var i = 0; i < snake.bodyX.length; i++)
  {
    var currentSegmentRect = new Phaser.Geom.Rectangle(snake.bodyX[i], snake.bodyY[i], 30, 30, 0x000000);
    graphics.fillRectShape(currentSegmentRect);
  }
  graphics.fillRectShape(snake.head);
  graphics.fillRectShape(coin.shape);

}

function bodySegmentMapHelper(currentSegment, index, arr)
{
  if (index != 0)
  {
    return currentSegment = arr[index - 1];
  }
  else
  {
    return currentSegment
  }
}

function update()
{
  if(this.swipe.check() != null){
    alert("Swipe detected!");
  }
  
  if(cursors.left.isDown)
  {
    snake.direction = 'left';
  }
  else if(cursors.right.isDown)
  {
    snake.direction = 'right';
  }
  else if(cursors.up.isDown)
  {
    snake.direction = 'up';
  }
  else if(cursors.down.isDown)
  {
    snake.direction = 'down';
  }

  if (counter == 15)
  {
    graphics.clear();

    if(Phaser.Geom.Rectangle.Overlaps(snake.head, coin.shape))
    {
      var bodyXTail = snake.bodyX[snake.bodyX.length - 1];
      var bodyYTail = snake.bodyY[snake.bodyY.length - 1];
      snake.bodyX.push(bodyXTail);
      snake.bodyY.push(bodyYTail);

    }
    snake.bodyX = snake.bodyX.map(bodySegmentMapHelper);
    snake.bodyY = snake.bodyY.map(bodySegmentMapHelper);
    snake.bodyX[0] = snake.head.x;
    snake.bodyY[0] = snake.head.y;

    if (snake.direction == 'up')
    {
      snake.head.y -= snake.delta;
    }
    else if (snake.direction == 'down')
    {
      snake.head.y += snake.delta;
    }
    else if (snake.direction == 'left')
    {
      snake.head.x -= snake.delta;
    }
    else
    {
      snake.head.x += snake.delta;
    }

    for (var i = 0; i < snake.bodyX.length; i++)
    {
      var currentSegmentRect = new Phaser.Geom.Rectangle(snake.bodyX[i], snake.bodyY[i], 30, 30, 0x000000);
      graphics.fillRectShape(currentSegmentRect);
    }
    graphics.fillRectShape(snake.head);
    counter = 0;
  }

  graphics.fillRectShape(coin.shape);

  counter += 1;

}
