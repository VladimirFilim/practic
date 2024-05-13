import {canvas, ctx, movementSpeed} from "./game.js";

class Sprite {
    constructor(sp_options, img) {
        this.dead = false;
        this.SCALE = sp_options.scale;  //коэффициент увеличения
        this.WIDTH = sp_options.width;   // ширина кадра
        this.HEIGHT = sp_options.height;  //высота кадра
        this.SCALED_WIDTH = sp_options.scale * sp_options.width; // ширина увеличенного кадра (для отрисовки)
        this.SCALED_HEIGHT = sp_options.scale * sp_options.height;  //высота увеличенного кадра
        this.C_LOOP = sp_options.c_loop;  // порядок отрисовки кадров
        this.FACING_DOWN = sp_options.facing_down;  // номер строки кадров при движении вниз
        this.FACING_UP = sp_options.facing_up;      // номер строки кадров при движении вверх
        this.FACING_LEFT = sp_options.facing_left;   // номер строки кадров при движении влево
        this.FACING_RIGHT = sp_options.facing_right;   // номер строки кадров при движении вправо
        this.FRAME_LIMIT = sp_options.frame_limit;     // общее количество кадров
        this.MOVEMENT_SPEED = sp_options.movement_speed;  //скорость
        this.keyPresses = {};
        this.currentDirection = sp_options.facing_down;
        this.currentLoopIndex = 0;
        this.frameCount = 0;
        this.hit = false;
        this.spriteX = sp_options.spriteX;
        this.spriteY = sp_options.spriteY;
        this.img = new Image();
        this.img.src = img;
    }
    Update() {
        this.spriteY += movementSpeed / 5;
        if (this.spriteY > canvas.height + 50) {
            this.dead = true;
        }
    }

    drawFrame() {
        ctx.drawImage(
            this.img,
            this.C_LOOP[this.currentLoopIndex] * this.WIDTH,
            this.currentDirection * this.HEIGHT,
            this.WIDTH,
            this.HEIGHT,
            this.spriteX,
            this.spriteY,
            this.SCALED_WIDTH,
            this.SCALED_HEIGHT);
    }

    moveit(directionX, directionY, direction) {
        if (this.spriteX + directionX > 0 && this.spriteX + this.SCALED_WIDTH + directionX < canvas.width) {
            this.spriteX += directionX;
        }
        if (this.spriteY + directionY > 0 && this.spriteY + this.SCALED_HEIGHT + directionY < canvas.height) {
            this.spriteY += directionY;
        }
        this.currentDirection = direction;
    }

    moveLoop() {
        let hasMoved = false;
        this.moveit(this.MOVEMENT_SPEED, 0, this.FACING_RIGHT);
        hasMoved = true;

        if (hasMoved) {
            this.frameCount++;
            if (this.frameCount >= this.FRAME_LIMIT) {
                this.frameCount = 0;
                this.currentLoopIndex++;
                if (this.currentLoopIndex >= this.C_LOOP.length) {
                    this.currentLoopIndex = 0;
                }
            }
        }

        if (!hasMoved) {
            this.currentLoopIndex = 0;
        }
    }
}

export { Sprite };
