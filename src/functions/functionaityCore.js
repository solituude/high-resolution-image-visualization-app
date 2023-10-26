
// получение изначального массива яркости пикселей (каждая яркость пикселя - 10 бит)
export const getInitialBrightnessArray = (event) => {
    const fileData = event.target.result; //получение данных из бинарного файла
    let initialBrightnessArray = []; // инициализация массива яркости пикселей
    let binaryArray = new Uint16Array(fileData); //бинарный массив, который хранит по 16 бит информации, полученной из бинарного файла
    let imageWidth = binaryArray[0]; // получение ширины изображения

    let imageHeight = binaryArray[1]; // получение высоты изображения
    let dataIndex = 2; // индекс, с которого будет происходить считывание информации о яркости каждого пикселя из массива бинарных чисел

    for (let y = 0; y < imageHeight; y++) { // цикл составляющий массив яркости пикселей
        let row = []; //создание строки масивва яркости пикселя
        for (let x = 0; x < imageWidth; x++) {
            row.push(binaryArray[dataIndex] & 0b1111111111);  // добавление в строку массива информативой части яркости пикселя
            dataIndex++;
        }
        initialBrightnessArray.push(row); // добавление строки в массив яркости
    }
    return initialBrightnessArray;
}

// получение матрицы яркости пикселей изображения для дальнейшего построения изображения в RGB, используя режим TrueColor
// аргументы функции: массив яркости пикселей (в представлении 10 бит, т.е. от 0 до 1023) и сдвиг
export const getConvertedBrightnessArray = (initialBrightnessArray, shift) => {
    let pixelBrightnessMatrix = []; // инициализация массива, являющийся результатом работы функции
    for (let y = 0; y < initialBrightnessArray.length; y++) {
        let rowMatrix = []
        for (let x = 0; x < initialBrightnessArray[0].length; x++) {
            rowMatrix.push((initialBrightnessArray[y][x] >> shift) & 0xFF);
        }
        pixelBrightnessMatrix.push(rowMatrix);
    }
    return pixelBrightnessMatrix
}

// содание иходной матрицы обзорного изображения (яркость пикселя от 0 до 1023)
export const getReducedInitBrightness = (initialBrightnessArray) => {
    const reducedInitBrightness = [];
    const DECREASE = 5;

    for (let y = 0; y <= initialBrightnessArray.length - DECREASE; y+=DECREASE) {
        let rowArray = [];
        for (let x = 0; x <= initialBrightnessArray[0].length - DECREASE; x += DECREASE) {
            const subArray = initialBrightnessArray.slice(y, y + DECREASE).map(row => row.slice(x, x + DECREASE));
            let sum = subArray.flat().reduce((answer, item) => answer + item, 0)
            rowArray.push(Math.round(sum/(DECREASE*DECREASE)));
        }
        reducedInitBrightness.push(rowArray);
    }
    return reducedInitBrightness;
}


export const getNearestNeighbor = (convertedColor, zoom, delta) => {
    let zoomArray = [];
    // console.log(delta)
    for (let y = 0; y < convertedColor.length; y++) {
        const row = [];
        for (let x = 0 ; x < convertedColor[0].length; x++) {
            for (let countRepeat = 0; countRepeat < zoom; countRepeat++) {
                row.push(convertedColor[y][x]);
            }
        }
        for (let countRepeat = 0; countRepeat < zoom; countRepeat++) {
            zoomArray.push(row.slice());
        }
    }
    if (delta === 0) {
        return zoomArray;
    } else return zoomArray.slice(delta, zoomArray.length - delta).map(row => row.slice(delta, row.length - delta));

}

export const getInterpolateArray  = (zoom, increaseArray) => {
    const interpolateArray = [];
    for (let y = 0; y < increaseArray.length - zoom; y++) {
        const newRow = [];
        for (let x = 0; x < increaseArray[0].length; x++) {

            const I1 = increaseArray[y][x];
            const I2 = increaseArray[y][x + zoom];
            const I3 = increaseArray[y + zoom][x];
            const I4 = increaseArray[y + zoom][x + zoom];
            let Xloc = (x % zoom) / zoom;
            let Yloc = (y % zoom) / zoom;

            let d = I1;
            let a = I2 - d;
            let b = I3 - d;
            let c = I4 - a - b - d;
            let Iloc;

            if (x >= increaseArray.length - zoom) {
                Iloc = b * Yloc + d;
            } else {
                Iloc = a * Xloc + b * Yloc + c * Xloc * Yloc + d;
            }
            newRow.push(Iloc);
        }
        interpolateArray.push(newRow);
    }
    // обработка случая при зуме последних строк изображения
    for (let y = increaseArray.length - zoom; y < increaseArray.length; y++) {
        const newRow = [];
        for (let x = 0; x < increaseArray[0].length; x++) {
            const I1 = increaseArray[y][x];
            const I2 = increaseArray[y][x + zoom];

            const Xloc = (x % zoom) / zoom;

            let d = I1;
            let a = I2 - d;

            let Iloc = a * Xloc + d;
            newRow.push(Iloc);
        }
        interpolateArray.push(newRow);
    }
    return interpolateArray;
}

export const findMinMaxValue = (array) => {
    try {
        let minValue = array[0][0];
        let maxValue = array[0][0];
        for (let y = 0; y < array.length; y++) {
            for (let x = 0; x < array[0].length; x++) {
                minValue = Math.min(minValue, array[y][x]);
                maxValue = Math.max(maxValue, array[y][x]);
            }
        }
        return {minValue, maxValue}
    } catch (e) {
        console.log('error');
    }

}

export const getNormalizeColorArray = (initialBrightnessArray, minValue, maxValue) => {
    const normalizeColorArray = [];
    for (let y = 0; y < initialBrightnessArray.length; y++) {
        const rowNormalizeColorArray = [];
        for (let x = 0; x < initialBrightnessArray[0].length; x++) {
            const normalizePixel = Math.round((initialBrightnessArray[y][x] - minValue) / maxValue * 255);
            rowNormalizeColorArray.push(normalizePixel);
        }
        normalizeColorArray.push(rowNormalizeColorArray);
    }
    return normalizeColorArray;
}




