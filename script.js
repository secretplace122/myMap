// Константы
const HOUSE_WIDTH = 1000;
const HOUSE_HEIGHT = 627;
const HOME_GPS = {
    north: 56.228284,
    south: 56.228140,
    west: 37.018656,
    east: 37.019023
};

// Структура дома
const houseMap = {
    rooms: [
        { id: 'living', name: 'Гостиная', x: 20, y: 20, width: 300, height: 400 },
        { id: 'balcon', name: 'Балкон', x: 20, y: 420, width: 300, height: 100 },
        { id: 'hallway', name: 'Коридор', x: 320, y: 20, width: 200, height: 300 },
        { id: 'bathroom', name: 'Санузел', x: 320, y: 320, width: 200, height: 200 }
    ],
    person: { x: 0, y: 0 }
};

// DOM элементы
const mapElement = document.getElementById('map');
const gpsInfoElement = document.getElementById('gpsInfo');

// Инициализация карты
function initMap() {
    mapElement.innerHTML = '';
    
    houseMap.rooms.forEach(room => {
        const roomElement = document.createElement('div');
        roomElement.className = 'room';
        roomElement.style.left = `${room.x}px`;
        roomElement.style.top = `${room.y}px`;
        roomElement.style.width = `${room.width}px`;
        roomElement.style.height = `${room.height}px`;
        roomElement.textContent = room.name;
        mapElement.appendChild(roomElement);
    });
    
    const personElement = document.createElement('div');
    personElement.className = 'person';
    personElement.id = 'person';
    mapElement.appendChild(personElement);
}

// Центрирование карты
function centerOnPerson() {
    const person = document.getElementById('person');
    if (person) {
        mapElement.scrollTo({
            left: parseFloat(person.style.left) - mapElement.clientWidth / 2,
            top: parseFloat(person.style.top) - mapElement.clientHeight / 2,
            behavior: 'smooth'
        });
    }
}

// Установка позиции
function setPersonPosition(x, y) {
    const clampedX = Math.max(0, Math.min(x, HOUSE_WIDTH));
    const clampedY = Math.max(0, Math.min(y, HOUSE_HEIGHT));
    
    houseMap.person.x = clampedX;
    houseMap.person.y = clampedY;
    
    const personElement = document.getElementById('person');
    if (personElement) {
        personElement.style.left = `${clampedX}px`;
        personElement.style.top = `${clampedY}px`;
        centerOnPerson();
    }
    
    gpsInfoElement.textContent = `Координаты: X=${clampedX.toFixed(1)}, Y=${clampedY.toFixed(1)}`;
    console.log('Позиция установлена:', clampedX, clampedY);
}

// Конвертация координат
function convertGPSToHouse(lat, lng) {
    if (HOME_GPS.north <= HOME_GPS.south || HOME_GPS.east <= HOME_GPS.west) {
        console.error("Границы дома заданы неверно!");
        return { x: 0, y: 0 };
    }
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error("Некорректные координаты!");
        return { x: 0, y: 0 };
    }
    
    const x = ((lng - HOME_GPS.west) / (HOME_GPS.east - HOME_GPS.west)) * HOUSE_WIDTH;
    const y = HOUSE_HEIGHT - ((lat - HOME_GPS.south) / (HOME_GPS.north - HOME_GPS.south)) * HOUSE_HEIGHT;
    
    console.log('Конвертация:', {lat, lng}, '→', {x, y});
    return { x, y };
}

// GPS трекинг
function startTracking() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            position => {
                const { latitude, longitude } = position.coords;
                const { x, y } = convertGPSToHouse(latitude, longitude);
                setPersonPosition(x, y);
            },
            error => {
                console.error("Ошибка GPS:", error);
                alert("Ошибка получения координат: " + error.message);
            },
            { 
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 27000
            }
        );
    } else {
        alert("Геолокация не поддерживается вашим браузером!");
    }
}

// Ручной ввод
function setManualPosition() {
    const lat = parseFloat(prompt("Введите широту (например, 56.228280):"));
    const lng = parseFloat(prompt("Введите долготу (например, 37.018664):"));
    
    if (!isNaN(lat) && !isNaN(lng)) {
        const { x, y } = convertGPSToHouse(lat, lng);
        setPersonPosition(x, y);
    } else {
        alert("Некорректные координаты!");
    }
}

// Тестовые точки
document.getElementById('testNW').addEventListener('click', () => {
    const { x, y } = convertGPSToHouse(56.228280, 37.018664);
    setPersonPosition(x, y);
});

document.getElementById('testNE').addEventListener('click', () => {
    const { x, y } = convertGPSToHouse(56.228280, 37.018849);
    setPersonPosition(x, y);
});

document.getElementById('testSW').addEventListener('click', () => {
    const { x, y } = convertGPSToHouse(56.228164, 37.018664);
    setPersonPosition(x, y);
});

document.getElementById('testSE').addEventListener('click', () => {
    const { x, y } = convertGPSToHouse(56.228164, 37.018849);
    setPersonPosition(x, y);
});

// Инициализация
document.getElementById('startTracking').addEventListener('click', startTracking);
document.getElementById('manualPosition').addEventListener('click', setManualPosition);
window.addEventListener('load', initMap);