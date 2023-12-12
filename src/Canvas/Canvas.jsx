import React, {useState, useEffect, useRef} from 'react';
import '../App.scss';
import {
    findMinMaxValue,
    getConvertedBrightnessArray,
    getInitialBrightnessArray,
    getInterpolateArray,
    getLimitedBrightnessArray,
    getNearestNeighbor,
    getNormalizeColorArray,
    getReducedInitBrightness
} from "../functions/functionaityCore";
import BarChart from "../BarChart/BarChart";


const Canvas = ({file, shift, barLabels}) => {
    const containerRef = useRef(); // ссылка на контейнер с изображением

    const [image, setImage] = useState(null); // Создаем состояние для хранения изображения

    // обзорное изображение
    const [overviewImage, setOverviewImage] = useState(null);

    // увеличение изображение
    const [zoom, setZoom] = useState(4);

    // матрица яркости для дальнейшнего определения яркости пикселя по координате
    const [brightnessMatrix, setBrightnessMatrix] = useState([]);

    //массив яркостей, который отображается в приложении
    const [convertedBrightness, setConvertedBrightness] = useState([]);

    //минимальное значение по У визуализируемого изображения
    const [minY, setMinY] = useState(0);

    // const [convertedBrightnessMatrix, setConvertedBrightnessMatrix] = useState([]);
    const [imageSize, setImageSize] = useState({height: 0, width: 0}); // размер изображения
    const canvas = document.createElement('canvas'); // создание элемента холста в приложении
    const overviewCanvas = document.createElement('canvas'); // создание холста для обзорного изображения
    const magnifierCanvas = document.createElement('canvas'); //холст для увеличененного изображения
    magnifierCanvas.height = 300; // высота увеличенного изображения
    magnifierCanvas.width = 300; // ширина увеличенного изображения
    const magnifierContext = magnifierCanvas.getContext('2d'); // контекст холста увеличенного изображения
    let magnifierImageData = magnifierContext.createImageData(magnifierCanvas.width, magnifierCanvas.width);
    const containerMagnifier = document.getElementById('magnifier-container');
    const containerImage = document.getElementById('pictureContainer');

    // координата наведенного пикселя изображения
    const [hoveredPixelCoordinatesPicture, setHoveredPixelCoordinatesPicture] = useState({x: 0, y: 0});
    // координата наведенного пикселя контейнера, в котором находится изображение
    const [hoveredPixelCoordinatesContainer, setHoveredPixelCoordinatesContainer] = useState({x: 0, y: 0});
    // яркость наведенного пикселя
    const [hoveredPixelBrightness, setHoveredPixelBrightness] = useState(0);

    const [isNormalize, setIsNormalize] = useState(false); // флаг нормализации увеличенного изображения
    const [isInterpolate, setIsInterpolate] = useState(false); // флаг интерполяции увеличенного изображения

    // значения для слайдера, для назнаечния границы цвета
    const [value, setValue] = useState({min: 0, max: 255});

    // использовать массив ниже для отображения изображения (в качестве начальных настроек минимальное значение
    // яркости 0, а максимальное 255, а массив выше использовать для построения гистограммы изображения)
    // также можно использовать не useState а просто переменной присваивать значение функции, которая будет возварщать
    // массив с ограниченной яркостью
    // const limitedBrightness = getLimitedBrightnessArray(convertedBrightness, value.min, value.max)

    // создание обзорного изображения
    const createOverviewImage = (initialBrightnessArray, shift) => {
        const reducedBrightnessArray = getReducedInitBrightness(initialBrightnessArray);
        const convertedColor = getConvertedBrightnessArray(reducedBrightnessArray, shift);
        overviewCanvas.height = convertedColor.length;
        overviewCanvas.width = convertedColor[0].length;

        const overviewContext = overviewCanvas.getContext('2d'); // контекст созданного холста для дальнейшего взаимодествия с ним
        const overviewImageData = overviewContext.createImageData(convertedColor[0].length, convertedColor.length); // создание объекта ImageData с указанымми размерами (все пиксели черные прозрачные при инициализации)

        for (let y = 0; y < convertedColor.length; y++) { // цикл по высоте изображения
            for (let x = 0; x < convertedColor[0].length; x++) { // уикл по ширине изображения
                const brightness = convertedColor[y][x]; // яркость пикселя
                const index = (y * convertedColor[0].length + x) * 4; // вычисление индекса для заполнения объекта ImageData

                overviewImageData.data[index] = brightness;
                overviewImageData.data[index + 1] = brightness;
                overviewImageData.data[index + 2] = brightness;
                overviewImageData.data[index + 3] = 255;
            }
        }
        overviewContext.putImageData(overviewImageData, 0, 0); // отрисовка данных на холсте начиная с координат (0,0)
        const dataURL = overviewCanvas.toDataURL();
        const overviewImg = new Image(); // создание элемента изображения
        overviewImg.src = dataURL;

        setOverviewImage(overviewImg);
    }

    // создание изображения
    const createImage = (initialColor, selectedOption) => {
        let convertedColor = getConvertedBrightnessArray(initialColor, selectedOption); // получение матрицы яркости пикселей изображения для дальнейшего построения изображения в RGB
        setConvertedBrightness(convertedColor);
        convertedColor = getLimitedBrightnessArray(convertedColor, value.min, value.max)
        const imageHeight = convertedColor.length; // высота изображения
        const imageWidth = convertedColor[0].length; // ширина изображения

        setImageSize({height: imageHeight, width: imageWidth}); // назначение размеров изображения в состояние, для отображения в инетрфейсе

        canvas.width = imageWidth; // назначение ширины изображения
        canvas.height = imageHeight; // назначение высоты изображения

        const ctx = canvas.getContext('2d'); // контекст созданного холста для дальнейшего взаимодествия с ним

        const imageData = ctx.createImageData(imageWidth, imageHeight); // создание объекта ImageData с указанымми размерами (все пиксели черные прозрачные при инициализации)

        for (let y = 0; y < imageHeight; y++) { // цикл по высоте изображения
            for (let x = 0; x < imageWidth; x++) { // уикл по ширине изображения
                const brightness = convertedColor[y][x]; // яркость пикселя
                const index = (y * imageWidth + x) * 4; // вычисление индекса для заполнения объекта ImageData

                imageData.data[index] = brightness; // присваивание красного спектра
                imageData.data[index + 1] = brightness; // присваивание зеленого спектра
                imageData.data[index + 2] = brightness; // присваивание синего спектра
                imageData.data[index + 3] = 255; // присваивание непрозрачности пикселя
            }
        }
        ctx.putImageData(imageData, 0, 0); // отрисовка данных на холсте начиная с координат (0,0)
        const dataURL = canvas.toDataURL();
        const img = new Image(); // создание элемента изображения
        img.src = dataURL;

        setImage(img);
    }

    // Функция обработки события загрузки файла
    const handleUploadFile = () => {
        if (file) { // проверка на загрузку файла
            const reader = new FileReader(); // объект, обладающий возможностями взаимодейтвия с файлами
            reader.onload = function (e) { // обработчик события чтения файла
                let initialColor = getInitialBrightnessArray(e); // создание массива яркости (каждая яркость от 0 до 1023)
                setBrightnessMatrix(initialColor); // назначение матрицы яркости массива созданной выше, для удобвства в дальнейшем использовании

                const selectedOption = parseInt(shift); // выбранный сдвиг

                createImage(initialColor, selectedOption)
                createOverviewImage(initialColor, 2);
            };
            reader.readAsArrayBuffer(file);
        }
    }


    // назначение координаты картинки
    const setCoordinatesPicture = (x, y) => {
        try {
            setHoveredPixelCoordinatesPicture({x, y});
        } catch (e) {
            console.log(e.message);
        }
    }

    // назначение яркости при наведениии на картинку
    const setBrightness = (x, y) => {
        try {
            setHoveredPixelBrightness(brightnessMatrix[y][x]);
        } catch (e) {
            console.log(e.message);
        }
    }

    const setMagnifierPicture = (currX, currY) => {
        const delta = magnifierCanvas.height % zoom === 0 ? Math.floor((magnifierCanvas.height) / (2 * zoom)) :
            Math.ceil((magnifierCanvas.height) / (2 * zoom));

        const context = magnifierCanvas.getContext('2d');
        const reducedArray = brightnessMatrix.slice(currY - delta, currY + delta + 1).map(row =>
            row.slice(currX - delta, currX + delta + 1));
        const minMaxBrightness = findMinMaxValue(reducedArray);

        const existingMagnifierCanvas = containerMagnifier.querySelector('canvas');
        if (existingMagnifierCanvas) {
            containerMagnifier.removeChild(existingMagnifierCanvas);
        }
        let convertedReducedArray;

        if (isNormalize) {
            convertedReducedArray = getNormalizeColorArray(reducedArray, minMaxBrightness.minValue, minMaxBrightness.maxValue);
            convertedReducedArray = getConvertedBrightnessArray(convertedReducedArray, 0);
        } else {
            convertedReducedArray = getConvertedBrightnessArray(reducedArray, parseInt(shift));
        }

        convertedReducedArray = getNearestNeighbor(convertedReducedArray, zoom,
            (convertedReducedArray.length * zoom - magnifierCanvas.height) / 2);

        if (isInterpolate) {
            convertedReducedArray = getInterpolateArray(zoom, convertedReducedArray,);
        }

        for (let y = 0; y < convertedReducedArray.length; y++) {
            for (let x = 0; x < convertedReducedArray[0].length; x++) {
                const brightness = convertedReducedArray[y][x]; // яркость пикселя
                const index = (y * convertedReducedArray[0].length + x) * 4; // вычисление индекса для заполнения объекта ImageData

                magnifierImageData.data[index] = brightness; // присваивание красного спектра
                magnifierImageData.data[index + 1] = brightness; // присваивание зеленого спектра
                magnifierImageData.data[index + 2] = brightness; // присваивание синего спектра
                magnifierImageData.data[index + 3] = 255; // присваивание прозрачности пикселя
            }
        }
        context.putImageData(magnifierImageData, 0, 0); // отрисовка данных на холсте начиная с координат (0,0)
        containerMagnifier.appendChild(magnifierCanvas);
    }

    // обработчик события движения курсора по картинке
    const handleMouseMovePicture = (event) => {
        const image = document.getElementById('image'); // ID элемента изображения
        const rect = image.getBoundingClientRect(); // координаты элемента изображения в окне

        const x = Math.floor(Math.max(event.clientX - rect.left, 0));
        const y = Math.floor(Math.max(event.clientY - rect.top, 0));

        setCoordinatesPicture(x, y);
        setBrightness(x, y);
        const borderValue = Math.round(magnifierCanvas.height / (2 * zoom));
        if ((x - borderValue > 0 && x + borderValue < 499) && (y - borderValue > 0 && y + borderValue < 2999)) {
            setMagnifierPicture(x, y);
        }

    }

    // обработчик события движения курсора в контейнере
    const handleMouseMoveContainer = (event) => {
        const imageContainer = document.getElementById('pictureContainer'); // ID элемента изображения
        const rect = imageContainer.getBoundingClientRect(); // координаты элемента изображения в окне

        const x = Math.floor(Math.max(event.clientX - rect.left, 0));
        const y = Math.floor(Math.max(event.clientY - rect.top, 0));

        setHoveredPixelCoordinatesContainer({x, y});
    }


    // получаю верхнюю границу изображения
    const handleScroll = () => {
        setMinY(parseInt(containerRef.current.scrollTop));
    }


    useEffect(() => {
        handleUploadFile(); // После получения файла и сдвига или изменения файла/сдвига, создаем изображение
        console.log(convertedBrightness);
    }, [file, shift, value]);


    return (
        <div className="content">
            <div className="coordinates__container">
                <p>Координаты курсора</p>
                <table>
                    <tbody>
                    <tr>
                        <td>X:</td>
                        <td className={"coordinates__item"}>{hoveredPixelCoordinatesPicture.x}</td>
                    </tr>
                    <tr>
                        <td>Y(относительно всего изображения):</td>
                        <td className={"coordinates__item"}>{hoveredPixelCoordinatesPicture.y}</td>
                    </tr>
                    <tr>
                        <td>Y(относительно визуализированного объекта):</td>
                        <td className={"coordinates__item"}>{hoveredPixelCoordinatesContainer.y}</td>
                    </tr>
                    <tr>
                        <td>Яркость:</td>
                        <td className={"coordinates__item"}>{hoveredPixelBrightness}</td>
                    </tr>
                    <tr>
                        <td>Ширина изображения:</td>
                        <td className={"coordinates__item"}>{imageSize.width}</td>
                    </tr>
                    <tr>
                        <td>Высота изображения:</td>
                        <td className={"coordinates__item"}>{imageSize.height}</td>
                    </tr>
                    </tbody>
                </table>

                <BarChart setValue={setValue}
                          value={value}
                          barLabels={barLabels}
                          convertedBrightness={brightnessMatrix}
                          selectedOption={shift}
                          yMin={minY}/>
            </div>

            {
                overviewImage ?
                    <div id="overviewContainer" className="overviewPicture">
                        <img id="overviewImage" src={overviewImage.src} alt="overview"/>
                    </div> : null
            }
            {
                image ?
                    <div onMouseMove={handleMouseMoveContainer} className="pictureContainer">
                        <div ref={containerRef} onScroll={handleScroll} id="pictureContainer"
                             onMouseMove={handleMouseMovePicture} className="pic">
                            <img id="image" src={image.src} alt="Generated" style={{marginBottom: "-4px"}}/>
                        </div>
                    </div> :
                    <div className="pictureContainer">
                        <span>Загрузите изображения</span>
                    </div>
            }
            <div className="zoom__container">
                <p className="coordinates__item">Инструмент "Лупа"</p>
                <form className="checkbox__container">
                    <div>
                        <input id="normalize-brightness" type="checkbox" checked={isNormalize}
                               onChange={() => setIsNormalize(!isNormalize)}/>
                        <label htmlFor="normalize-brightness">Нормировать яркость</label>
                    </div>
                    <div>
                        <input id="interpolate" type="checkbox" checked={isInterpolate}
                               onChange={() => setIsInterpolate(!isInterpolate)}/>
                        <label htmlFor="interpolate">Интерполировать</label>
                    </div>
                </form>

                <div className="magnifier__area" id="magnifier-container"></div>
                <label htmlFor="id">Увеличить в {zoom} раза</label>
                <input id="zoom" type="range" min="4" max="20" value={zoom} onChange={(e) =>
                    setZoom(parseInt(e.target.value))} step="8"/>
            </div>
        </div>

    );
}

export default Canvas;