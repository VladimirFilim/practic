import { Car } from "./Car.js";
import { Road } from "./Road.js";
import { Sprite } from "./Sprite.js";
import { RandomInteger } from "./Utils.js";

//TODO:
// Сохраняется баг, связанный с гибелью персонажа - серый экран просле смерти. Пофиксить
// Разобраться с координатами (Пешеходы должны исчезать за областью видимости, как и машины)
// Игрок не должен иметь возможности на то, чтобы уехать за область видимости
// Пешеходы должны иметь возможность с каким-то шансом вставать посреди дороги и смотреть на водителя
// Добавление ям на обочине в силе
// Возможно добавление следа от шин при торможении
// Добавить динамику
// Добавить систему счета + усложнения игры в зависимости от очков
// Возможно изменение времени суток и изменение погоды (ориентироваться на оставшееся время)

export const movementSpeed = 3; // Скорость движения (можете настроить)
const timerInterval = 16; // Интервал в миллисекундах (примерно 60 кадров в секунду)
let timer = setInterval(onTimer, timerInterval);
let chanceOfCarSpawnVal = 9830;
let chanceOfPedestrianSpawnVal = 9960;
let isMovingRight, isMovingLeft, isMovingUp, isMovingDown = false;
let carWidth = 195;

const canvas = document.getElementById("canvas");
//Получение холста из DOM
const ctx = canvas.getContext("2d");
export const scale = 0.15; //Масштаб машин

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
export let player = new Car("images/car.png", canvas.width * 0.5, canvas.height * 0.5, true);

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

    if (RandomInteger(0, 10000) > chanceOfCarSpawnVal) { //создание новых автомобилей
        let randomCarX = RandomInteger(30, canvas.width - 50);
        let randomCarY = RandomInteger(250, 400) * -1;
        if(checkIfCarAbleToSpawn(randomCarX, carWidth)) {
            cars.push(new Car("images/car_red.png", randomCarX, randomCarY, false));
        }
    }

    if (RandomInteger(0, 10000) > chanceOfPedestrianSpawnVal) { //создание новых пешеходов
        let sp_options = {
            scale: 3,
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
            spriteY: RandomInteger(0, canvas.height * 0.25)
        };
        for (let i = 0; i < pedestrians.length; i++) {
            console.log("Pedestrian position:", pedestrians[i].spriteX, pedestrians[i].spriteY);
            console.log(pedestrians[i].img.src);
            console.log(pedestrians[i].img.width);
            console.log(pedestrians[i].img.height);
            pedestrians[i].drawFrame();
        }
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

        if (pedestrians[i].spriteX >= 1400) {
            pedestrians.splice(i, 1);
        }
    }

    let hit = false;

    for (let i = 0; i < cars.length; i++) {
        hit = player.CollideWithCar(cars[i]);
        if(cars[i].y >= 675) {
            cars.splice(i, 1);
        }
        if (hit) {
            player.CollideBoom("Car");
            break;
        }
    }

    for (let i = 0; i < pedestrians.length; i++) {
        hit = player.CollideWithPedestrian(pedestrians[i]);
        if (hit) {
            player.CollideBoom("Pedestrian");
            break;
        }
    }
    Draw();
}

function checkIfCarAbleToSpawn(carX, carWidth) {
    let roadLeftBorder = 183;
    let roadRightBorder = 825;
    let isOnRoad = carX + carWidth >= roadLeftBorder && carX + carWidth / 2 <= roadRightBorder;

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
function Draw() { //Работа с графикой
    ctx.clearRect(0, 0, canvas.width, canvas.height); //Очистка холста от предыдущего кадра
    for (let i = 0; i < roads.length; i++) {
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

export { Car, Road, timer, canvas, ctx, Resize, KeyDown, KeyUp, onTimer, Draw, RandomInteger, Start, Stop, Update, checkIfCarAbleToSpawn };