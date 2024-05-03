var movementSpeed = 3; // Скорость движения (можете настроить)
var timerInterval = 16; // Интервал в миллисекундах (примерно 60 кадров в секунду)
var timer = setInterval(onTimer, timerInterval);

let isMovingRight, isMovingLeft, isMovingUp, isMovingDown = false;

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



class Car {
    constructor(image, x, y) {
        this.dead = false;
        this.x = x;
        this.y = y;
        this.image = new Image();
        this.image.src = image;
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
                hit = true;
            }
        }
        return hit;
    }

    CollideWithPedestrian(pedestrian) {
        let hit = false;
        console.log(`${this.y} < ${pedestrian.spriteY} + ${pedestrian.SCALED_HEIGHT} && ${this.y + this.image.height * scale} > ${pedestrian.spriteY}`);
        if (this.y < pedestrian.spriteY + pedestrian.SCALED_HEIGHT && this.y + this.image.height * scale > pedestrian.spriteY) { //Если объекты находятся на одной линии по горизонтали
            if (this.x < pedestrian.spriteX + pedestrian.SCALED_WIDTH && this.x + this.image.width * scale > pedestrian.spriteX) { //Если объекты находятся на одной линии по вертикали
                hit = true;
            }
        }
        return hit;
    }
}


class Road {
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

// добавить
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

let time_bum;

const canvas = document.getElementById("canvas");
//Получение холста из DOM
const ctx = canvas.getContext("2d");
const scale = 0.2; //Масштаб машин

Resize(); // При загрузке страницы задаётся размер холста

window.addEventListener("resize", Resize); //При изменении размеров окна будут меняться размеры холста
window.addEventListener("keydown", function (e) { KeyDown(e); }); //Получение нажатий с клавиатуры
window.addEventListener("keyup", function (e) { KeyUp(e); });
window.addEventListener("click", Start); //Получение нажатий с клавиатуры 
let cars = []; //Массив игровых объектов
let pedestrians = []; //Массив пешеходов

let roads = [
    new Road("images/road.jpg", 0),
    new Road("images/road.jpg", canvas.height)
];

//Объект, которым управляет игрок
let player = new Car("images/car.png", canvas.width / 2, canvas.height / 2, true);

function Start() {
    window.removeEventListener("click", Start); //удаление нажатий с клавиатуры 
    timer = setInterval(Update, 1000 / 60); //Состояние игры будет обновляться 60 раз в секунду — при такой частоте обновление происходящего будет казаться очень плавным
}

function Stop() {
    window.removeEventListener("click", Start); //удаление нажатий с клавиатуры 
    window.removeEventListener("keydown", function (e) { KeyDown(e); }, false);
    clearInterval(timer); //Остановка обновления
}


function Update() {
    roads[0].Update(roads[1]);
    roads[1].Update(roads[0]);

    if (RandomInteger(0, 10000) > 9700) { //создание новых автомобилей
        cars.push(new Car("images/car_red.png", RandomInteger(30, canvas.width - 50), RandomInteger(250, 400) * -1, false));
    }

    if (RandomInteger(0, 10000) > 9900) { //создание новых автомобилей
        let sp_options = {
            scale: 2,
            width: 16,
            height: 18,
            c_loop: [0, 1, 0, 2],
            facing_down: 0,
            facing_up: 1,
            facing_left: 2,
            facing_right: 3,
            frame_limit: RandomInteger(3, 12),
            movement_speed: RandomInteger(1, 5),
            spriteX: 10,
            spriteY: RandomInteger(0, canvas.height / 4)
        };
        pedestrians.push(new Sprite(sp_options, 'images/gc.png'));
    }



    for (let i = 0; i < cars.length; i++) {
        cars[i].Update();
    }


    cars = cars.filter(function (n) {
        return !n.dead
    })

    for (let i = 0; i < pedestrians.length; i++) {
        pedestrians[i].Update();
        pedestrians[i].moveLoop();
    }

    let hit = false;

    for (let i = 0; i < cars.length; i++) {
        hit = player.CollideWithCar(cars[i]);
        if (hit) {
            Stop();
            time_bum = setInterval(bum, 50);
            player.dead = true;
            break;
        }
    }


    for (let i = 0; i < pedestrians.length; i++) {
        hit = player.CollideWithPedestrian(pedestrians[i]);
        if (hit) {
            Stop();
            time_bum = setInterval(bum, 50);
            player.dead = true;
            break;
        }
    }
    Draw();
}

function checkIfCarAbleToSpawn(carX, carWidth) {
    let isOnRoad = carX + carWidth / 2 >= (canvas.width - roadWidth) / 2 && carX + carWidth / 2 <= (canvas.width + roadWidth) / 2;

    // Проверка, что машина не появится на другой машине
    let isNotOnAnotherCar = true;
    for (let i = 0; i < cars.length; i++) {
        let otherCar = cars[i];
        if (carX < otherCar.x + otherCar.image.width * scale && carX + carWidth > otherCar.x) {
            isNotOnAnotherCar = false; // Появится на другой машине
            break;
        }
    }

    return isOnRoad && isNotOnAnotherCar;
}

function bum() {
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

function Draw() { //Работа с графикой
    ctx.clearRect(0, 0, canvas.width, canvas.height); //Очистка холста от предыдущего кадра
    for (var i = 0; i < roads.length; i++) {
        ctx.drawImage(
            roads[i].image, //Изображение для отрисовки
            0, //Начальное положение по оси X на изображении
            0, //Начальное положение по оси Y на изображении
            roads[i].image.width, //Ширина изображения
            roads[i].image.height, //Высота изображения
            roads[i].x, //Положение по оси X на холсте
            roads[i].y, //Положение по оси Y на холсте
            canvas.width, //Ширина изображения на холсте
            window.innerHeight //высота
        );
    }
    DrawCar(player);
    for (let i = 0; i < cars.length; i++) {
        DrawCar(cars[i]);
    }

    for (let i = 0; i < pedestrians.length; i++) {
        pedestrians[i].drawFrame();
    }
}

function KeyDown(key) {
    switch (key.keyCode) {
        case 65: //влево
            isMovingLeft = true;
            break;

        case 68: //вправо
            isMovingRight = true;
            break;

        case 87: //вверх
            isMovingUp = true;
            break;

        case 83: //вниз
            isMovingDown = true;
            break;

        case 27: //Esc
            if (timer == null) {
                Start();
            }
            else {
                Stop();
            }
            break;
    }
}

function KeyUp(e) {
    switch (e.keyCode) {
        case 65: //влево
            isMovingLeft = false;
            break;

        case 68: //вправо
            isMovingRight = false;
            break;

        case 87: //вверх
            isMovingUp = false;
            break;

        case 83: //вниз
            isMovingDown = false;
            break;
    }
}

function onTimer() {
    if (isMovingLeft) {
        player.x -= movementSpeed;
    }
    if (isMovingRight) {
        player.x += movementSpeed;
    }
    if (isMovingUp) {
        player.y -= movementSpeed;
    }
    if (isMovingDown) {
        player.y += movementSpeed;
    }
}

function Resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}


function DrawCar(car) { // отрисовка автомобиля
    ctx.drawImage(
        car.image,
        0,
        0,
        car.image.width,
        car.image.height,
        car.x,
        car.y,
        car.image.width * scale,
        car.image.height * scale
    );
}


function RandomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}

function Draw0() { //Кнопка старт
    Draw();
    let start = new Image();
    start.src = "images/start.png";
    start.onload = function () {
        ctx.drawImage(start, canvas.width / 3, canvas.height / 5);
    }
}

window.onload = Draw0; 