import {canvas, movementSpeed} from "./game.js";

export class Road {
    constructor(image, y) {
        this.x = 0;
        this.y = y;

        this.image = new Image();
        this.image.src = image;
    }

    Update(road) {
        this.y += movementSpeed; //При обновлении изображение смещается вниз
        if (this.y > window.innerHeight) { //Если изображение ушло за край холста, то меняем положение
            this.y = road.y - canvas.height + movementSpeed; //Новое положение указывается с учётом второго фона
        }
    }
}
