window.onload = function()
{   
    var canvasWidth = 900;
    var canvasHeight = 600;
    var blockSize = 30;
    var ctx;
    var delay = 100;
    var xCoord = 0;
    var yCoord = 0;
    var snakee;
    var applee;
    var widthInBlock = canvasWidth/blockSize;
    var heightInBlock = canvasHeight/blockSize;
    var score;
    var timeout;
    
    init();
    function init()
    {
        var canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "20px solid #333";
        canvas.style.margin = "20px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd";
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        snakee = new Snake([[6,4],[5,4],[4,4]], "right");
        applee = new Apple([10, 10]);
        score = 0;
        refreshCanvas();
    }
    
    function refreshCanvas()
    {
        snakee.advance();
        if(snakee.checkCollision())
        {
            gameOver();
        }
        else
        {
            if(snakee.isEatingApple(applee))
            {
                score += 100;
                snakee.ateApple = true;
                do
                {
                    applee.setNewPosition();
                }
                while(applee.isOnSnake(snakee))
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            snakee.draw();
            applee.draw();
            drawScore();
            timeout = setTimeout(refreshCanvas,delay);
        }
    }
    
    function drawblock(ctx,position)
    {
        var x = position[0]*blockSize;
        var y = position[1]*blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    } 
        
    function gameOver()
    {
        ctx.save();
        ctx.fillStyle = "#222";
        ctx.font = "bold 30px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("=== GAME OVER ===", canvasWidth/2 , canvasHeight/2 - 40);
        ctx.fillText("Appuyer ESPACE pour continuer", canvasWidth/2 , canvasHeight/2 );
        ctx.restore();
    }
    
    function restart()
    {
        snakee = new Snake([[6,4],[5,4],[4,4]], "right");
        applee = new Apple([10, 10]);
        score = 0;
        clearTimeout(timeout);
        refreshCanvas();
    }
    
    function drawScore()
    {
        ctx.save();
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("score: " + score.toString(), 15, canvasHeight - 15);
        ctx.restore();
    }
    
    function Snake(body, direction)
    {
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        this.draw = function()
        {
            ctx.save();
            ctx.fillStyle = "#ff0000";
            for( var i=0; i<this.body.length; i++)
            {
                drawblock(ctx,this.body[i]);
            }
            ctx.restore();
        };
        this.advance = function()
        {
            var nextposition = this.body[0].slice();
            switch(this.direction)
            {
                case "right":
                    nextposition[0] += 1;
                    break;
                case "left":
                    nextposition[0] -= 1;
                    break;
                case "down":
                    nextposition[1] += 1;
                    break;
                case "up":
                    nextposition[1] -= 1;
                    break;
                default:
                    throw("Invalid Direction");
            } 
            this.body.unshift(nextposition);
            if (!this.ateApple)
                this.body.pop();
            else
                this.ateApple = false;
        };
        this.setDirection = function(newDirection)
        {
            var allowedDirections;
            switch (this.direction)
            {
                case "right":
                case "left":
                    allowedDirections=["down", "up"];
                    break;
                case "down":
                case "up":
                    allowedDirections=["left", "right"];
                    break;
                default:
                    throw("Invalid Direction");
            }
            if(allowedDirections.indexOf(newDirection) >= 0)
            {
                this.direction = newDirection;
            }
        };
        this.checkCollision = function()
        {
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.body[0];
            var rest = this.body.slice(1);
            var snakeX = head[0];
            var snakeY = head[1];
            var minX = 0;
            var minY = 0;
            var maxX = widthInBlock - 1;
            var maxY = heightInBlock - 1;   
            
            var isNotbetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            var isNotbetweenVerticalWalls = snakeY < minY || snakeY > maxY;
            if(isNotbetweenHorizontalWalls || isNotbetweenVerticalWalls)
                wallCollision = true;
            
            for(var i=0; i < rest.length; i++)
            {
                if(snakeX === rest[i][0] && snakeY === rest[i][1])
                    snakeCollision = true;
            }
            return snakeCollision || wallCollision;
        };
        this.isEatingApple = function(appleToEat)
        {
            var head = this.body[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
                return true;
            else return false;
        }
    }
    
    function Apple(position)
    {
        this.position = position;
        this.draw = function()
        {
            ctx.save();
            ctx.fillStyle = "#33cc33"
            ctx.beginPath();
            var radius = blockSize/2;
            var x = this.position[0]*blockSize + radius;
            var y = this.position[1]*blockSize + radius;
            ctx.arc(x, y, radius, 0, Math.PI*2, true);
            ctx.fill();
            ctx.restore();
        };
        this.setNewPosition = function()
        {
            var newX = Math.round(Math.random()*(widthInBlock - 1));
            var newY= Math.round(Math.random()*(heightInBlock - 1));
            this.position = [newX, newY];
        };
        this.isOnSnake = function(snakeToCheck)
        {
            var isOnSnake = false;
            for (var i=0; i<snakeToCheck.body.length; i++)
            {
                if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1])
                    isOnSnake = true;
            }
            return isOnSnake;
        };
    }
    
    document.onkeydown = function handleKeyDown(e)
    {
    var key = e.keyCode;
    var newDirection;
    switch(key)
        {
            case 37:
                newDirection = "left";
                break;
            case 38:
                newDirection = "up";
                break;
            case 39:
                newDirection = "right";
                break;
            case 40:
                newDirection = "down";
                break;
            case 32:
                restart();
                return;
            default:
                return;
        }
    snakee.setDirection(newDirection);
    };

}

