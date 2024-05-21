//TODO:
// Пешеходы должны иметь возможность с каким-то шансом вставать посреди дороги и смотреть на водителя
// Добавление ям на обочине в силе
// Возможно добавление следа от шин при торможении
// Добавить систему счета + усложнения игры в зависимости от очков
// Возможно изменение времени суток и изменение погоды (ориентироваться на оставшееся время)

const TIMER_INTERVAL = 16; // Интервал в миллисекундах (примерно 60 кадров в секунду)
const CANVAS = document.getElementById("canvas");
const CONTEXT = CANVAS.getContext("2d");
const SCALE = (CANVAS.width + CANVAS.height) / 1000; //Масштаб машин
const DECELERATION = 0.6; // Замедление при торможении
const NATURAL_DECELERATION = DECELERATION / 2; // Естественное замедление при отпускании W
const MAX_SPEED = 5; // Максимальная скорость
const MAX_CAR_SPEED = 3;
const SCALE_OF_RED_CAR = SCALE * 2;
const SCALE_OF_YELLOW_CAR = SCALE * 4.2;
const SCALE_OF_PINK_CAR = SCALE * 4.2;

let currentSpeed = 0; // Текущая скорость игрока
let isBraking = false; // Флаг торможения
let isAccelerating = false; // Флаг ускорения
let carMovementSpeed = 3; // Скорость движения (можете настроить)
let timer = setInterval(onTimer, TIMER_INTERVAL);
let chanceOfCarSpawnVal = 9900;
let chanceOfPedestrianSpawnVal = 9960;
let isMovingRight, isMovingLeft, isMovingUp, isMovingDown = false;
let roadsideRightBorder;
let roadsideLeftBorder;
let pedestrians = [];
let cars = [];
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
        this.spriteY += carMovementSpeed;
        if (this.spriteY > CANVAS.height + 50) {
            this.dead = true;
        }
    }

    drawFrame() {
        CONTEXT.drawImage(
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
        if (this.spriteX + directionX > 0 && this.spriteX + this.SCALED_WIDTH + directionX < CANVAS.width) {
            this.spriteX += directionX;
        }
        if (this.spriteY + directionY > 0 && this.spriteY + this.SCALED_HEIGHT + directionY < CANVAS.height) {
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
        this.speed = RandomInteger(1, 2);
    }

    Update() {
        this.y += carMovementSpeed;
        if (this.y > CANVAS.height + 50) {
            this.dead = true;
        }
    }

    CollideWithCar(car) {
        let hit = false;
        if (this.y < car.y + car.image.height * SCALE && this.y + this.image.height * SCALE > car.y) {//Если объекты находятся на одной линии по горизонтали
            if (this.x < car.x + car.image.width * SCALE && this.x + this.image.width * SCALE > car.x) { //Если объекты находятся на одной линии по вертикали
                hit = true;
            }
        }
        return hit;
    }

    CollideWithPedestrian(pedestrian) {
        let hit = false;
        if (this.y < pedestrian.spriteY + pedestrian.SCALED_HEIGHT && this.y + this.image.height * SCALE > pedestrian.spriteY) { //Если объекты находятся на одной линии по горизонтали
            if (this.x < pedestrian.spriteX + pedestrian.SCALED_WIDTH && this.x + this.image.width * SCALE > pedestrian.spriteX) { //Если объекты находятся на одной линии по вертикали
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
        this.y += carMovementSpeed; //При обновлении изображение смещается вниз
        if (this.y > window.innerHeight) { //Если изображение ушло за край холста, то меняем положение
            this.y = road.y - CANVAS.height + carMovementSpeed ; //Новое положение указывается с учётом второго фона
        }
        if (this.y < -CANVAS.height) { // Если изображение ушло за край холста вверх
            this.y = road.y + CANVAS.height - carMovementSpeed; // Новое положение указывается с учётом второго фона
        }
    }
}

Resize(); // При загрузке страницы задаётся размер холста

window.addEventListener("resize", Resize); //При изменении размеров окна будут меняться размеры холста
window.addEventListener("keydown", function (e) { KeyDown(e); }); //Получение нажатий с клавиатуры
window.addEventListener("keyup", function (e) { KeyUp(e); });
window.addEventListener("click", Start); //Получение нажатий с клавиатуры

let roads = [
    new Road("images/road.jpg", 0),
    new Road("images/road.jpg", CANVAS.height)
];

//Объект, которым управляет игрок
let player = new Car("images/car.png", CANVAS.width * 0.5, CANVAS.height * 0.5, true);

function Start() {
    window.removeEventListener("click", Start); // удаление нажатий с клавиатуры
    timer = setInterval(Update, 1000 / 60); // Состояние игры будет обновляться 60 раз в секунду — при такой частоте обновление происходящего будет казаться очень плавным
}

function Stop() {
    window.removeEventListener("click", Start); // удаление нажатий с клавиатуры
    window.removeEventListener("keydown", function (e) { KeyDown(e); }, false);
    clearInterval(timer); // Остановка обновления
}

function Update() {
    roads[0].Update(roads[1]);
    roads[1].Update(roads[0]);
    roadsideLeftBorder = CANVAS.width / 100 * 20;
    roadsideRightBorder = CANVAS.width / 5 * 4 - 40;

    for (let i = 0; i < cars.length; i++) {
        // Обновление позиции машины по вертикали с учетом случайной скорости
        cars[i].y -= cars[i].speed;
    }

    if (RandomInteger(0, 10000) > chanceOfCarSpawnVal) {
        let randomCarX = RandomInteger(roadsideLeftBorder, roadsideRightBorder);
        let randomCarY = RandomInteger(-100, -50); // Генерация случайной координаты y за пределами видимой области сверху
        let randomNumberOfCarColor = RandomInteger(1, 3);
        let carSrc;
        switch (randomNumberOfCarColor) {
            case 1:
                carSrc = "images/car_yellow.png";
                break;
            case 2:
                carSrc = "images/car_red.png";
                break;
            case 3:
                carSrc = "images/car_pink.png";
                break;
        }
        let car = new Car(carSrc, randomCarX, randomCarY);
        if (checkIfCarAbleToSpawn(car, cars)) { // Передача массива всех машин
            cars.push(car);
        }
    }

    if (RandomInteger(0, 10000) > chanceOfPedestrianSpawnVal) { //создание новых пешеходов
        let pedestrianOptions = {
            scale: 4,
            width: 72,
            height: 72,
            c_loop: [0, 1, 0, 2],
            facing_down: 0,
            facing_up: 1,
            facing_left: 2,
            facing_right: 3,
            frame_limit: RandomInteger(2, 27),
            movement_speed: RandomInteger(1, 5),
            spriteX: 10,
            spriteY: RandomInteger(0, CANVAS.height * 0.25)
        };
        for (let i = 0; i < pedestrians.length; i++) {
            pedestrians[i].drawFrame();
        }
        pedestrians.push(new Sprite(pedestrianOptions, 'images/pedestrian_sprite01.png'));
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

        if (pedestrians[i].spriteX >= CANVAS.width - 100) {
            pedestrians.splice(i, 1);
        }
    }

    let hit = false;

    for (let i = 0; i < cars.length; i++) {
        hit = player.CollideWithCar(cars[i]);
        if (cars[i].y >= CANVAS.height) {
            cars.splice(i, 1);
        }
        if (hit) {
            Stop();
            time_bum = setInterval(bum, 50);
            player.dead = true;
            alert("Died from Car collide!");
            break;
        }
    }

    for (let i = 0; i < pedestrians.length; i++) {
        hit = player.CollideWithPedestrian(pedestrians[i]);
        if (hit) {
            Stop();
            time_bum = setInterval(bum, 50);
            player.dead = true;
            alert("Died from Pedestrian collide!");
            break;
        }
    }
    Draw();
}

function checkIfCarAbleToSpawn(car, allCars) {
    let carScaleWidth, carScaleHeight;

    // Определение масштабируемых размеров для новой машины
    if (car.image.src.endsWith("images/car_yellow.png")) {
        carScaleWidth = car.image.width * SCALE_OF_YELLOW_CAR;
        carScaleHeight = car.image.height * SCALE_OF_YELLOW_CAR;
    } else if (car.image.src.endsWith("images/car_pink.png")) {
        carScaleWidth = car.image.width * SCALE_OF_PINK_CAR;
        carScaleHeight = car.image.height * SCALE_OF_PINK_CAR;
    } else if (car.image.src.endsWith("images/car_red.png")) {
        carScaleWidth = car.image.width * SCALE_OF_RED_CAR;
        carScaleHeight = car.image.height * SCALE_OF_RED_CAR;
    } else {
        carScaleWidth = car.image.width * SCALE;
        carScaleHeight = car.image.height * SCALE;
    }

    let isNotOnAnotherCar = true;
    for (let i = 0; i < allCars.length; i++) {
        let otherCar = allCars[i];
        let otherCarScaleWidth, otherCarScaleHeight;

        // Определение масштабируемых размеров для существующей машины
        if (otherCar.image.src.endsWith("images/car_yellow.png")) {
            otherCarScaleWidth = otherCar.image.width * SCALE_OF_YELLOW_CAR;
            otherCarScaleHeight = otherCar.image.height * SCALE_OF_YELLOW_CAR;
        } else if (otherCar.image.src.endsWith("images/car_pink.png")) {
            otherCarScaleWidth = otherCar.image.width * SCALE_OF_PINK_CAR;
            otherCarScaleHeight = otherCar.image.height * SCALE_OF_PINK_CAR;
        } else if (otherCar.image.src.endsWith("images/car_red.png")) {
            otherCarScaleWidth = otherCar.image.width * SCALE_OF_RED_CAR;
            otherCarScaleHeight = otherCar.image.height * SCALE_OF_RED_CAR;
        } else {
            otherCarScaleWidth = otherCar.image.width * SCALE;
            otherCarScaleHeight = otherCar.image.height * SCALE;
        }

        if (car.x < otherCar.x + otherCarScaleWidth &&
            car.x + carScaleWidth > otherCar.x &&
            car.y < otherCar.y + otherCarScaleHeight &&
            car.y + carScaleHeight > otherCar.y) {
            isNotOnAnotherCar = false;
            console.log("Car spawn rejected!!!");
            break;
        }
    }
    return isNotOnAnotherCar;
}


function bum() {
    if (gifOptions.numFrame < gifOptions.src.length) {
        CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
        Draw();
        let img = new Image();
        img.src = gifOptions.src[gifOptions.numFrame];
        img.onload = function () {
            CONTEXT.drawImage(img, player.x - img.width / 2, player.y - img.height / 2);
            gifOptions.numFrame++;
        }
    } else { clearInterval(time_bum) }
}

function Draw() { //Работа с графикой
    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height); //Очистка холста от предыдущего кадра
    for (let i = 0; i < roads.length; i++) {
        CONTEXT.drawImage(
            roads[i].image, //Изображение для отрисовки
            0, //Начальное положение по оси X на изображении
            0, //Начальное положение по оси Y на изображении
            roads[i].image.width, //Ширина изображения
            roads[i].image.height, //Высота изображения
            roads[i].x, //Положение по оси X на холсте
            roads[i].y, //Положение по оси Y на холсте
            CANVAS.width, //Ширина изображения на холсте
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
        case 65: // влево
            isMovingLeft = true;
            break;
        case 68: // вправо
            isMovingRight = true;
            break;
        case 87: // вверх (ускорение)
            isAccelerating = true;
            isBraking = false;
            break;
        case 83: // вниз (торможение)
            isBraking = true;
            isAccelerating = false;
            break;
        case 27: // Esc
            if (timer == null) {
                Start();
            } else {
                Stop();
            }
            break;
    }
}

function KeyUp(e) {
    switch (e.keyCode) {
        case 65: // влево
            isMovingLeft = false;
            break;
        case 68: // вправо
            isMovingRight = false;
            break;
        case 87: // вверх (ускорение)
            isAccelerating = false;
            break;
        case 83: // вниз (торможение)
            isBraking = false;
            break;
    }
}

function onTimer() {
    if (player.y + player.image.height * SCALE > CANVAS.height) {
        player.y = CANVAS.height - player.image.height * SCALE;
    }
    if (isMovingLeft) {
        player.x -= carMovementSpeed;
        if (player.x < 0) { // Проверка выхода за левую границу
            player.x = 0;
        }
    }
    if (isMovingRight) {
        player.x += carMovementSpeed;
        if (player.x + player.image.width * SCALE > CANVAS.width) { // Проверка выхода за правую границу
            player.x = CANVAS.width - player.image.width * SCALE;
        }
    }
    if (isAccelerating) {
        currentSpeed = Math.min(currentSpeed + DECELERATION, MAX_SPEED); // Ускорение
        carMovementSpeed = currentSpeed;
    } else if (isBraking) {
        currentSpeed = Math.max(currentSpeed - DECELERATION, -MAX_CAR_SPEED + 1); // Торможение до новой минимальной скорости для обычных машин плюс 1
        carMovementSpeed = -currentSpeed;
    } else {
        currentSpeed = Math.max(currentSpeed - NATURAL_DECELERATION, 0); // Естественное замедление
    }
    player.y -= currentSpeed; // Обновляем положение игрока с учетом текущей скорости
    roads.forEach(road => road.y += currentSpeed);
    cars.forEach(car => car.y += currentSpeed); // Двигать машины вниз
    pedestrians.forEach(pedestrian => pedestrian.spriteY += currentSpeed); // Двигать пешеходов вниз
}

function Resize() {
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
}

function DrawCar(car) {
    let scaleWidth;
    let scaleHeight;

    if (car.image.src.endsWith("images/car_yellow.png")) {
        scaleWidth = car.image.width * SCALE_OF_YELLOW_CAR;
        scaleHeight = car.image.height * SCALE_OF_YELLOW_CAR;
    } else if (car.image.src.endsWith("images/car_pink.png")) {
        scaleWidth = car.image.width * SCALE_OF_PINK_CAR;
        scaleHeight = car.image.height * SCALE_OF_PINK_CAR;
    } else if (car.image.src.endsWith("images/car_red.png")) {
        scaleWidth = car.image.width * SCALE_OF_RED_CAR;
        scaleHeight = car.image.height * SCALE_OF_RED_CAR;
    } else {
        scaleWidth = car.image.width * SCALE;
        scaleHeight = car.image.height * SCALE;
    }

    CONTEXT.drawImage(
        car.image,
        0,
        0,
        car.image.width,
        car.image.height,
        car.x,
        car.y,
        scaleWidth,
        scaleHeight
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
        CONTEXT.drawImage(start, CANVAS.width / 3, CANVAS.height / 5);
    }
}

window.onload = Draw0; 
