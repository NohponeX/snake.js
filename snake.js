var Quontest = new Image();
Quontest.src = "images/Q.png";
var lastTime = 0;

$(document).ready(function() {
    var theme = {
        snake : "#9C4150",
        snake_head : "#222",
        food : "#D7A79B",
        score : "#9C4150",
        border : "#B3D4A7",
        background : "#C6D4C1",
        tail : "rgba(156, 65, 80, 0.75)"

    }
    var directions = {
        left : [-1, 0],
        right : [+1, 0],
        up : [0, -1],
        down : [0, +1],
        opposite : function(direction) {
            if (direction == directions.left) {
                return directions.right;
            } else if (direction == directions.right) {
                return directions.left;
            } else if (direction == directions.up) {
                return directions.down;
            } else if (direction == directions.down) {
                return directions.up;
            }
            return [direction[0] * -1, direction[1] * -1];
        }
    };
    var snake = {
        direction : directions.up,
        positions : [],
        move : function() {
            var head = [this.positions[0][0] + this.direction[0], this.positions[0][1] + this.direction[1]];
            //
            //this.positions.unshift(head);
            //this.positions.shift();
            //console.log( snake.direction == directions.up );
            var tail = this.positions.pop();
            this.positions.unshift(head);
        },
        eat : function() {
            var head = [this.positions[0][0] + this.direction[0], this.positions[0][1] + this.direction[1]];
            this.positions.unshift(head);
        }
    };
    var game = {
        interval : null,
        width : 0,
        height : 0,
        box_width : 15,
        box_height : 15,
        food : null,
        score : 0,
        game_over : true,
        clear_border : true,
        sounds : true,
        paused : false,
        setup : function() {
            this.width = Math.floor(width / this.box_width) - 1;
            this.height = Math.floor((height - 30 ) / this.box_height) - 1;
            this.game_over = false;
            this.clear_border = true;
            //snake.positions = [];
            //snake.positions.push(
            snake.direction = directions.up;
            snake.positions = [[Math.floor(Math.random() * (this.width - 1 )) + 1, Math.floor(Math.random() * (this.height - this.height / 2 ) + this.height / 2)]];
            snake.eat();
            snake.eat();
            snake.eat();
            game.score = 0;
            game.interval = setInterval(game.tick, 125);
            game.draw_score();
        },
        Initialize : function() {
            game.setup();
            this.game_over = true;
            clearInterval(game.interval);
            game.draw();
            game.draw_game_over();
        },
        restart : function() {
            console.log('restart');
            clearInterval(game.interval);
            game.setup();
        },
        pause : function() {
            game.paused = true;
            game.draw_paused();
            //clearInterval(game.interval);
            //game.interval = null;
        },
        resume : function() {
            game.paused = false;
            if (!game.interval) {
                game.interval = setInterval(game.tick, 125);
            }
            game.draw_score();
        },
        tick : function() {
            if (game.game_over) {
                return;
            }
            if (game.paused) {
                game.draw();
                clearInterval(game.interval);
                game.interval = null;
                return;
            }
            
            if (game.food == null) {
                game.create_food();
            } else if (game.check_eat_food()) {
                snake.eat();
                game.create_food();
                game.score++;
                game.draw_score();
                AudioPlayer.consume();
            }
            snake.move();
            game.draw();
            if (game.check_wall_collusion() || game.check_snake_collusion()) {
                game.game_over = true;
            }
            if (game.game_over) {
                clearInterval(game.interval);
                console.log('game over');
                game.draw_score();
                game.draw_game_over();
                return;
            }

        },
        draw : function() {

            var i, j;
            //Draw borders
            if (true || game.clear_border) {
                context.clearRect(0, 0, width, this.box_height * game.height);
                context.fillStyle = theme.border;
                for ( i = 0; i <= game.width; i++) {
                    for ( j = 0; j <= game.height; j++) {
                        if (!j || !i || j == game.height || i == game.width) {
                            context.fillRect(this.box_width * i, this.box_height * j, this.box_width, this.box_height);
                        }
                    }
                }
                game.clear_border = false;
            } else {
                context.clearRect(this.box_width, this.box_height, (game.width - 1) * this.box_width, (game.height - 1 ) * this.box_height);
            }
            // Draw snake
            context.fillStyle = theme.snake_head;
            //context.fillRect(this.box_width * snake.positions[0][0], this.box_height * snake.positions[0][1], this.box_width, this.box_height);
            context.fillRect(this.box_width * snake.positions[0][0] + 0.5, this.box_height * snake.positions[0][1] + 0.5, this.box_width - 1, this.box_height - 1);
            //context.font = "15px Arial";
            //context.drawImage(Quontest,this.box_width * snake.positions[0][0] + 0.5, this.box_height * snake.positions[0][1] +0.5,this.box_width - 1, this.box_height - 1);
            //context.fillStyle = "#F1F738";
            //context.fillText("Q", this.box_width * (snake.positions[0][0]+0.12), this.box_height * (snake.positions[0][1]+0.88),25);
            context.fillStyle = theme.snake;
            for ( i = 1; i < snake.positions.length; i++) {
                //console.log(snake.positions[i]);
                if (i == snake.positions.length - 1) {
                    context.fillStyle = theme.tail;
                }
                context.fillRect(this.box_width * snake.positions[i][0] + 0.5, this.box_height * snake.positions[i][1] + 0.5, this.box_width - 1, this.box_height - 1);

            }
            // Draw food
            if (game.food) {
                //context.fillStyle = theme.food;
                context.drawImage(Quontest, this.box_width * game.food[0], this.box_height * game.food[1], this.box_width, this.box_height);
                //context.fillRect(this.box_width * game.food[0], this.box_height * game.food[1], this.box_width, this.box_height);
            }
        },
        draw_score : function() {
            context.clearRect(0, (game.height + 2  ) * this.box_height, width, height - (game.height + 2  ) * this.box_height);
            context.fillStyle = theme.score;
            context.fillText("Score : " + this.score, this.box_width, (game.height + 3 ) * this.box_height);
        },
        draw_game_over : function() {
            context.fillStyle = theme.score;
            context.fillText("Game over press Enter to play", this.box_width + 100, (game.height + 3 ) * this.box_height);
        },
        draw_paused : function() {
            context.fillStyle = theme.score;
            context.fillText("Game paused press p to play", this.box_width + 100, (game.height + 3 ) * this.box_height);
        },
        check_snake_collusion : function() {
            for (var i = 1; i < snake.positions.length; i++) {
                if (snake.positions[ i ][0] == snake.positions[ 0 ][0] && snake.positions[ i ][1] == snake.positions[ 0 ][1]) {
                    console.log(snake.positions);
                    return true;
                }
            }
            return false;
        },
        check_wall_collusion : function() {
            var x = snake.positions[ 0 ][0];
            var y = snake.positions[ 0 ][1];
            if (!x || !y || x >= game.width || y >= game.height) {
                return true;
            }
            return false;
        },
        check_eat_food : function() {
            return (snake.positions[ 0 ][0] == game.food[0] && snake.positions[ 0 ][1] == game.food[1] );
        },
        create_food : function() {
            var x = 0, y = 0;
            var found = false;
            do {
                found = false;
                x = Math.floor(Math.random() * game.height);
                y = Math.floor(Math.random() * game.width);
                if (!x || !y || x >= game.width || y >= game.height) {
                    found = true;
                    continue;
                }
                for (var i = 0; i < snake.positions.length; i++) {
                    if (x == snake.positions[ i ][0] && y == snake.positions[ i ][1]) {
                        found = true;
                        break;
                    }
                }
            } while ( found );
            game.food = [x, y];
        }
    };
    //Canvas stuff
    var canvas = $("#canvas")[0];
    var context = canvas.getContext("2d");
    var width = $("#canvas").width();
    var height = $("#canvas").height();
        
    game.setup();
    game.pause();
    
    $(document).keydown(function(event) {
        switch (event.keyCode) {
            case 37:
            case 65:
                if (snake.direction == directions.left) {
                    game.tick();
                } else if (directions.left != directions.opposite(snake.direction)) {
                    snake.direction = directions.left;
                }
                event.preventDefault();
                break;
            case 38:
            case 87:
                if (snake.direction == directions.up) {
                    game.tick();
                } else if (directions.up != directions.opposite(snake.direction)) {
                    snake.direction = directions.up;
                }
                event.preventDefault();
                break;
            case 39:
            case 68:
                if (snake.direction == directions.right) {
                    game.tick();
                } else if (directions.right != directions.opposite(snake.direction)) {
                    snake.direction = directions.right;
                }
                event.preventDefault();
                break;
            case 40:
            case 83:
                if (snake.direction == directions.down) {
                    game.tick();
                } else if (directions.down != directions.opposite(snake.direction)) {
                    snake.direction = directions.down;
                }
                event.preventDefault();
                break;
            case 13:
                if (game.game_over) {
                    game.restart();
                    event.preventDefault();
                }
                break;
            case 80:
                if (game.game_over) {
                    game.restart();
                    event.preventDefault();
                } else if (game.paused) {
                    game.resume();
                } else {
                    game.pause();
                }
                event.preventDefault();
                break;
        }
    });
    AudioPlayer.Initialize();

});
var AudioPlayer = {
    sounds : {},
    consume : function() {
        this.sounds.consume.play();
    },
    Initialize : function() {
        this.sounds.consume = new Audio();

        this.sounds.consume.setAttribute('src', 'sounds/pick_up.wav');
        this.sounds.consume.repeat = false;
        this.sounds.consume.loop = false;
        this.sounds.consume.volume = 0.15;

    }
};
