import {canvas, ctx, movementSpeed, player, scale, Stop} from "./game.js";

let time_bum;
let gifOptions = {
    src: ["images/1_1.png",
        "images/1_2.png",
        "images/1_3.png",
        "images/1_4.png",
        "images/1_5.png",
        "images/1_6.png",
        "images/1_7.png",
        "images/1_8.png",
        "images/1_7.png",
        "images/1_6.png",
        "images/1_5.png",
        "images/1_4.png",
        "images/1_3.png",
        "images/1_2.png",
        "images/1_1.png"
    ],
    frames: 8,
    numFrame: 0,
};

export class Car {
    constructor(image, x, y) {
        this.dead = false;
        this.x = x;
        this.y = y;
        this.image = new Image();
        this.image.src = image;
    }

    bum() {
        if (gifOptions.numFrame < gifOptions.src.length) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            Draw();
            let img = new Image();
            img.src = gifOptions.src[gifOptions.numFrame];
            img.onload = function () {
                ctx.drawImage(img, player.x - img.width / 2, player.y - img.height / 2);
                gifOptions.numFrame++;
            }
        } else { clearInterval(time_bum) }
    }


    CollideBoom(hitType) {
        Stop();
        time_bum = setInterval(this.bum, 50);
        switch (hitType){
            case "Car":
                alert("Collide with Car!");
                break;
            case "Pedestrian":
                alert("Collide with Pedestrian!");
                break;
        }
        this.bum();
        time_bum = setInterval(this.bum, 50);
        player.dead = true;
        alert("Player died from collide with " + hitType)
    }

    Update() {
        this.y += movementSpeed;
        if (this.y > canvas.height + 50) {
            this.dead = true;
        }
    }

    CollideWithCar(car) {
        let hit = false;
        if (this.y < car.y + car.image.height * scale && this.y + this.image.height * scale > car.y) {//Если объекты находятся на одной линии по горизонтали
            if (this.x < car.x + car.image.width * scale && this.x + this.image.width * scale > car.x) { //Если объекты находятся на одной линии по вертикали
                this.CollideBoom("Car")
                {
                    Stop();
                    time_bum = setInterval(bum, 50);
                    player.dead = true;
                    alert("Player died from collide with " + hitType)
                }
            }
        }
        return hit;
    }

    CollideWithPedestrian(pedestrian) {
        let hit = false;
        if (this.y < pedestrian.spriteY + pedestrian.SCALED_HEIGHT && this.y + this.image.height * scale > pedestrian.spriteY) { //Если объекты находятся на одной линии по горизонтали
            if (this.x < pedestrian.spriteX + pedestrian.SCALED_WIDTH && this.x + this.image.width * scale > pedestrian.spriteX) { //Если объекты находятся на одной линии по вертикали
                hit = true;
            }
        }
        return hit;
    }
}
