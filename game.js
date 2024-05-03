//TODO: 
// Фикс наслаивания машин друг на друга и спавна машин далеко на обочине - ОК
// Увеличение размеров машин - ОК
// Уменьшение кол-ва спавнящихся пешеходов и машин - ОК
// Добавление различных моделей для пешеходов
// Добавление различных моделей для машин
// Добавление различных типов для пешеходов
// Добавление различных типов для машин
// Добавление ям на обочине
// Добавление системы очков
// Добавление системы усложнения игры
// Добавление системы убийства пешеходов после того, как они достигли края обочины

var movementSpeed = 3; // Скорость движения (можете настроить)
var timerInterval = 16; // Интервал в миллисекундах (примерно 60 кадров в секунду)
var timer = setInterval(onTimer, timerInterval);
var roadWidth = 817;
let chanceOfCarSpawnValue = 9850;
let chanceOfPedestrianSpawnValue = 9960;
let isMovingRight, isMovingLeft, isMovingUp, isMovingDown = false;

class Sprite {
    constructor (sp_options) {
        this.SCALE = sp_options.scale;  //коэффициент увеличения
        this.WIDTH = sp_options.width;   // ширина кадра
        this.HEIGHT = sp_options.height;  //высота кадра
        this.SCALED_WIDTH = sp_options.scale * sp_options.width; // ширина увеличенного кадра (для отрисовки)
        this.SCALED_HEIGHT = sp_options.scale * sp_options.height;  //высота увеличенного кадра 
        this.spriteX = sp_options.spriteX;
        this.spriteY = sp_options.spriteY;
	}
Update() {
   this.spriteY += movementSpeed/5;
   if(this.spriteY > canvas.height + 50) {
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
    constructor(car_options) {
        this.x = car_options.x;
        this.y = car_options.y;
        this.image = new Image();
        this.image.src = car_options.imageSrc;
    }

    static spawnNewCar() {
        if (RandomInteger(0, 10000) > chanceOfCarSpawnValue) {
            let randomX = RandomInteger(30, canvas.width - 50);
            let randomY = RandomInteger(250, 400) * -1;
            let carWidth = 195;
            if (checkIfCarAbleToSpawn(randomX, carWidth)) {
                let car_options = {
                    x: randomX,
                    y: randomY,
                    image: new Image()
                };
                car_options.image.src = "images/car_red.png";
                objects.push(new Car(car_options));
            }
        }
    }
}
 
class PlayersCar extends Car
{
    constructor(player_options) {
        super(player_options);
        this.dead = false;
    }
 
    Update() {
        this.y += movementSpeed;
		if(this.y > canvas.height + 50) {
			this.dead = true;
		}
    }
	
    CollideWithCar(car) {
    let hit = false;
    if(this.y < car.y + car.image.height * scale && this.y + this.image.height * scale > car.y) {//Если объекты находятся на одной линии по горизонтали
        if(this.x < car.x + car.image.width * scale && this.x + this.image.width * scale > car.x ) { //Если объекты находятся на одной линии по вертикали
            hit = true;
        }
    }
    return hit;
    }
	
	CollideWithPedestrian(pedestrians) {
        let hit = false;
        if(this.y < pedestrians.spriteY + pedestrians.SCALED_HEIGHT && this.y + this.image.height * scale > pedestrians.spriteY) { //Если объекты находятся на одной линии по горизонтали
            if(this.x < pedestrians.spriteX + pedestrians.SCALED_WIDTH  && this.x + this.image.width * scale > pedestrians.spriteX ) { //Если объекты находятся на одной линии по вертикали
                hit = true;
            }
        }
        return hit;
    }
}

class Pedestrian extends Sprite {
    constructor(sp_options, pedestrian_options) {
        super(sp_options)
        this.C_LOOP = pedestrian_options.c_loop;  // порядок отрисовки кадров
        this.FACING_DOWN = pedestrian_options.facing_down;  // номер строки кадров при движении вниз
        this.FACING_UP = pedestrian_options.facing_up;      // номер строки кадров при движении вверх
        this.FACING_LEFT = pedestrian_options.facing_left;   // номер строки кадров при движении влево
        this.FACING_RIGHT = pedestrian_options.facing_right;   // номер строки кадров при движении вправо
        this.FRAME_LIMIT = pedestrian_options.frame_limit;     // общее количество кадров
        this.MOVEMENT_SPEED = pedestrian_options.movement_speed;  //скорость 
        this.currentDirection = pedestrian_options.facing_down;
        this.currentLoopIndex = 0;
        this.frameCount = 0;
        this.img = new Image();
        this.img.src = img;
    }

    Update() {
        if(RandomInteger(0, 10000) > chanceOfPedestrianSpawnValue) { //создание новых пешеходов
            let sp_options = {
                scale: 2,
                width: 16,
                height: 18,
                spriteX: 10,
                spriteY: RandomInteger(0, canvas.height/4),
            };
            let pedestrian_options = {
                c_loop: [0, 1, 0, 2], 
                facing_down: 0,
                facing_up: 1,
                facing_left: 2,
                facing_right: 3,
                frame_limit: RandomInteger(3, 12),
                movement_speed: RandomInteger(1, 5),
                img: 'images/gc.png'
            }
            pedestrians.push(new Pedestrian(sp_options, pedestrian_options));
        }
    }

    PedestrianKill(pedestrians) {
        for(let i = 0; i < pedestrians.length; i++) {
            if(pedestrians[i].spriteX + pedestrians.SCALED_WIDTH >= 1080) {
                pedestrians[i].splice(i, 1);
            }
        }
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
        if(this.y > window.innerHeight) { //Если изображение ушло за край холста, то меняем положение
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
let objects = []; //Массив игровых объектов
let pedestrians = []; //Массив пешеходов

let roads = [
    new Road("images/road.jpg", 0),
    new Road("images/road.jpg", canvas.height)
]; 
 
 //Объект, которым управляет игрок
 let player_options = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    image: new Image()
};
player_options.image.src = "images/players_car.png";
let player = new PlayersCar(player_options);
 
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
	
	for(let i = 0; i < pedestrians.length; i++) {
		pedestrians[i].Update();
		pedestrians[i].moveLoop();
	}
	
	let hit = false;

	for(let i = 0; i < objects.length; i++) {
		hit = player.CollideWithCar(objects[i]);
		if(hit) {						
			Stop();
			time_bum = setInterval(bum, 50);
			player.dead = true;
			break;
		}
	}
	
	
	for(let i = 0; i < pedestrians.length; i++) {
		hit = player.CollideWithPedestrian(pedestrians[i]);
		if(hit) {					
			Stop();
			time_bum = setInterval(bum, 50);
			player.dead = true;
			break;
		}
	}

    Car.spawnNewCar();

    Draw();
}

function checkIfCarAbleToSpawn(carX, carWidth) {
    let isOnRoad = carX + carWidth / 2 >= (canvas.width - roadWidth) / 2 && carX + carWidth / 2 <= (canvas.width + roadWidth) / 2;
    
    // Проверка, что машина не появится на другой машине
    let isNotOnAnotherCar = true;
    for (let i = 0; i < objects.length; i++) {
        let otherCar = objects[i];
        if (carX < otherCar.x + otherCar.image.width * scale && carX + carWidth > otherCar.x) {
            isNotOnAnotherCar = false; // Появится на другой машине
            break;
        }
    }

    return isOnRoad && isNotOnAnotherCar;
}

function bum() {
	if (gifOptions.numFrame<gifOptions.src.length) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		Draw();
		let img=new Image();
		img.src = gifOptions.src[gifOptions.numFrame];
		img.onload = function() {
            ctx.drawImage(img, player.x-img.width/2, player.y-img.height/2);
            gifOptions.numFrame++;
		}
	} else {clearInterval(time_bum)}
}
 
function Draw() { //Работа с графикой
    ctx.clearRect(0, 0, canvas.width, canvas.height); //Очистка холста от предыдущего кадра
	for(var i = 0; i < roads.length; i++) {
        ctx.drawImage (
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
	for(let i = 0; i < objects.length; i++) {     
		DrawCar(objects[i]);
	}
	
	for(let i = 0; i < pedestrians.length; i++) {   
        pedestrians[i].drawFrame();
	}
}

function KeyDown(key) {
    switch(key.keyCode) {
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
			if(timer == null) {
				Start();
			}
			else {
				Stop();
			}
			break;
	}
}

function KeyUp(e) {
    switch(e.keyCode) {
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
    if(isMovingLeft) {
        player.x -= movementSpeed;
    }
    if(isMovingRight) {
        player.x += movementSpeed;
    }
    if(isMovingUp) {
        player.y -= movementSpeed;
    }
    if(isMovingDown) {
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
    start.onload = function() {
    ctx.drawImage(start, canvas.width/3, canvas.height/5);
	}
}

window.onload = Draw0; 