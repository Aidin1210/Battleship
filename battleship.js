/**
 * объект представления
 * @type {{displayMessage: view.displayMessage, displayHit: view.displayHit, displayMiss: view.displayMiss}}
 */
var view = {
    /**
     * Метод для вывода сообщения пользователю
     * @param msg
     */
    displayMessage: function (msg) {
        var messageArea = document.getElementById('messageArea');
        messageArea.innerHTML = msg;
    },
    /**
     * метод отрисовывания попадания на игровом поле
     * @param location
     */
    displayHit: function (location) {
        var cell = document.getElementById(location);
        cell.setAttribute('class', 'hit');
    },
    /**
     * метод отрисовывания промаха на игровом поле
     * @param location
     */
    displayMiss: function (location) {
        var cell = document.getElementById(location);
        cell.setAttribute('class', 'miss');
    }
};

/**
 * объект модели
 * @type {{boardSize: number, numShips: number, shipsSunk: number, shipLength: number, ships: [*],
 *         fire: model.fire, isSunk: model.isSunk, generateShipLocations: model.generateShipLocations,
 *         generateShip: model.generateShip, collision: model.collision}}
 */
var model = {
    boardSize: 7,
    numShips: 3,
    shipsSunk: 0,
    shipLength: 3,
    ships: [{locations: ['0', '0', '0'], hits: ['', '', '']}, // 1-й корабль
            {locations: ['0', '0', '0'], hits: ['', '', '']}, // 2-й корабль
            {locations: ['0', '0', '0'], hits: ['', '', '']}], // 3-й корабль
    /**
     * метод для определения попадания в корабль
     * @param guess
     * @returns {boolean}
     */
    fire: function (guess) {
        for (var i = 0; i < this.numShips; i++) {
            var ship = this.ships[i];
            // если координаты клетки присутсивуют в массиве, то выстрел попал в цель
            var index = ship.locations.indexOf(guess);
            // в массиве hits помечаем попадание, значение = index
            if (index >= 0) {
                ship.hits[index] = 'hit';
                // оповещаем представление о том, что нужно пометить маркером попадание в корабль в клетке guess
                view.displayHit(guess);
                // говорим представлению, чтобы нужно вывести сообщение 'HIT!'
                view.displayMessage('HIT!');
                //если корабль потоплен, то увеличиваем счетчик потопленных кораблей в свойстве shipsSunk модели
                if (this.isSunk(ship)) {
                    // приказываем представлению вывести сообщение для игрока, что он потопил корабль
                    view.displayMessage('You sank my battleship!');
                    this.shipsSunk++;
                }
                // истина возвращается, при удачном выстреле
                return true;
            }
        }
        // сообщаем представлению, что нужно вывести маркер промаха в клетке guess
        view.displayMiss(guess);
        // приказываем представлению вывести сообщение о промахе
        view.displayMessage('You missed! Ha-ha!');
        // если после перебора всех кораблей попадание не обнаружено, то игрок промахнулся, а метод возвращает false
        return false;
    },
    /**
     * метод проверки потоплен ли корабль
     * @param ship
     * @returns {boolean}
     */
    isSunk: function (ship) {
        // если есть хотя бы одна клетка, которая не помечена 'hit', то корабль еще не потоплен и возвращаем ложь
        for (var i = 0; i < this.shipLength; i++) {
            if (ship.hits[i] !== 'hit') {
                return false;
            }
        }
        // если корабль потоплен, то возвращаем истину
        return true;
    },
    /**
     * метод для генерации расположения кораблей
     */
    generateShipLocations: function () {
        var locations;
        for (var i = 0; i < this.numShips; i++) {
            do {
               locations = this.generateShip();
            } while (this.collision(locations));
            this.ships[i].locations = locations;
        }
    },
    /**
     * метод генерации кораблей
     * @returns {Array}
     */
    generateShip: function () {
        // генерируем число то 0 до 1
        var direction = Math.floor(Math.random() * 2);
        var row, col;

        if (direction === 1) { // если direction = 1, то создается горизонтальный корабль
            // Сгенерировать начальную позицию для горизонтального корабля
            row = Math.floor(Math.random() * this.boardSize);
            col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
        } else { // если direction = 0, то создается вертикальный корабль
            // Сгенерировать начальную позицию для вертикального корабля
            row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
            col = Math.floor(Math.random() * this.boardSize);
        }

        var newShipLocations = [];
        for (var i = 0; i < this.shipLength; i++) {
            if (direction === 1) {
                // добавить в массив для горизонтального корабля
                newShipLocations.push(row + '' + (col + i));
            } else {
                // добавить в массив для вертикального корабля
                newShipLocations.push((row + i) + '' + col);
            }
        }
        // возвращаем массив
        return newShipLocations;
    },
    /**
     * метод для проверки наложения корабля на корабль
     * @param locations
     * @returns {boolean}
     */
    collision: function (locations) {
        for (var i = 0; i < this.numShips; i++) {
            var ship = this.ships[i];

            for (var j = 0; j < locations.length; j++) {
                if (ship.locations.indexOf(locations[j]) >= 0) {
                    return true;
                }
            }
        }
        return false;
    }
};
/**
 * объект контроллера
 * @type {{guesses: number, processGuess: controller.processGuess}}
 */
var controller = {
    guesses: 0,
    /**
     * метод processGuess, получающий координаты в формате 'A0'
     * @param guess
     */
    processGuess: function (guess) {
        // метод parseGuess будет использоваться для проверки введенных данных
        var location = parseGuess(guess);
        // если метод не возвращает null, значит был получен действительный объект location
        if (location) {
            // если полльзователь ввел правильные координаты, то счетчик увеличивается на 1,
            // при вводе недействительных координат, попытка в подсчет не включается
            this.guesses++;
            var hit = model.fire(location);
            // если выстрел попал в цель, а количество потопленных кораблей равно количеству кораблей в игре,
            // выводится сообщение о том, что все корабли потоплены
            if (hit && model.shipsSunk === model.numShips) {
                view.displayMessage("You sank all my battleships, in " + this.guesses + " guesses");
            }
        }
    }
};
/**
 * Вспомогательная функция для проверки введенных значений пользователем
 * @param guess
 * @returns {*}
 */
function parseGuess(guess) {
    // массив заполняется всеми буквами, которые могут присутствовать в действительных координатах
    var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    // проверяем данные на null и убеждаемся, что в строке два символа
    if (guess === null || guess.length !== 2) {
        alert("Oops, please enter a letter and a number on the board.");
    } else {
        // извлекаем первый символ строки
        var firstChar = guess.charAt(0);
        // при помощи метода indexOf получаем цифру в диапазоне от 0 до 6, соответствующую букве
        var row = alphabet.indexOf(firstChar);
        // получаем второй символ, представляющий столбец игрового поля
        var column = guess.charAt(1);

        // при помощи функция isNaN выявляем строки и столбцы, которые не являются цифрами
        if (isNaN(row) || isNaN(column)) {
            alert("Oops, that isn't on the board.");
        } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) { // проверяем, что цифры лежат в диапазоне от 0 до 6
            alert("Oops, that's off the board!");
        } else {
            // строка и столбец объединяются в строку, а результат возвращается методом
            return row + column;
        }
    }
    // если управление передано в эту точку, значит, какая-то проверка не прошла, и метод возвращает null
    return null;
}
/**
 * обработчик нажатия на кнопку выстрела 'Fire!'
 */
function handleFireButton() {
    // получаем ссылку на элемент формы по идентификатору элемента 'guessInput'
    var guessInput = document.getElementById('guessInput');
    // извлекаем данные, введенные пользователем
    var guess = guessInput.value;
    // координаты выстрела передаются контроллеру
    controller.processGuess(guess);
    // удаляем содержимое элемента input формы, заменяя его пустой строкой
    guessInput.value = '';

}

/**
 * обработчик нажатий клавиши 'Enter' вызывается, при каждом нажатии клавиши в поле input
 * @param e
 * @returns {boolean}
 */
function handleKeyPress(e) {
    var fireButton = document.getElementById('fireButton');
    // если нажата клавиша Enter, то свойство keyCode события равно 13
    if (e.keyCode === 13) {
        fireButton.click();
        // возвращаем false, чтобы форма не делала ничего лишнего (например, не пыталась передать данные)
        return false;
    }
}

function init() {
    // получаем ссылку на кнопку Fire! по идентификатору кнопки
    var fireButton = document.getElementById('fireButton');
    // назначаем обработчик события нажатия — функцию handleFireButton
    fireButton.onclick = handleFireButton;
    // обработчик для обработки событий нажатия клавиш в поле ввода HTML
    var guessInput = document.getElementById('guessInput');
    guessInput.onkeypress = handleKeyPress;
    // генерируем расположения кораблей
    model.generateShipLocations();
}

// браузер должен выполнять init, при полной загрузке страницы
window.onload = init;