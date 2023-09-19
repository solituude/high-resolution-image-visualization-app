// наложение маски для получения истинного значения яркости пикселя в десятибитовом представлении
const convertToTenBit = (item) => {
    //получение информативных младших 10 бит из двухбайтового представления цвета
    return item & 0b1111111111;
}

// получение ширины изображения
const getImageWidth = (binaryArray) => {
    const WIDTH_INDEX = 0; // индекс значения ширины изображения в бинарном массиве
    return parseInt(binaryArray[WIDTH_INDEX]);
}

// получение высоты изображения
const getImageHeight = (binaryArray) => {
    const HEIGHT_INDEX = 1; // индекс значения высоты изображение в бинарном массиве
    return parseInt(binaryArray[HEIGHT_INDEX]);
}


// получение изначального массива яркости пикселей (каждая яркость пикселя - 10 бит)
export const getInitialBrightnessArray = (event) => {
    const fileData = event.target.result; //получение данных из бинарного файла
    let initialBrightnessArray = []; // инициализация массива яркости пикселей
    let binaryArray = new Uint16Array(fileData); //бинарный массив, который хранит по 16 бит информации, полученной из бинарного файла
    let imageWidth = getImageWidth(binaryArray); // получение ширины изображения

    let imageHeight = getImageHeight(binaryArray); // получение высоты изображения
    let dataIndex = 2; // индекс, с которого будет происходить считывание информации о яркости каждого пикселя из массива бинарных чисел

    for (let y = 0; y < imageHeight; y++) { // цикл составляющий массив яркости пикселей
        let row = [];
        for (let x = 0; x < imageWidth; x++) {
            row.push(convertToTenBit(binaryArray[dataIndex]));  // добавление в массив информативой части яркости пикселя
            dataIndex++;
        }
        initialBrightnessArray.push(row);
    }
    return initialBrightnessArray;
}


// получение матрицы яркости пикселей изображения для дальнейшего построения изображения в RGB, используя технлологию TrueColor
// аргументы функции: массив яркости пикселей (в представлении 10 бит) и сдвиг
export const getConvertedBrightnessArray = (initialBrightnessArray, shift) => {
    let pixelBrightnessMatrix = []; // инициализация массива, являющийся результатом работы функции
    for (let i = 0; i < initialBrightnessArray.length; i++) {
        let rowMatrix = []
        for (let j = 0; j < initialBrightnessArray[0].length; j++) {
            let red = (initialBrightnessArray[i][j] >> shift) & 0b11111111; // вычисление красного спектра
            // вычисление зеленого спектра
            let green = ((initialBrightnessArray[i][j] >> shift) & 0b11111111) | (initialBrightnessArray[i][j] >> (8 + shift));
            let blue = green; // синий спектр == зеленый спектр
            rowMatrix.push({Red: red, Green: green, Blue: blue});
        }
        pixelBrightnessMatrix.push(rowMatrix);
    }
    return pixelBrightnessMatrix
}





