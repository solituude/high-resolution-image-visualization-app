import React, {useState, useEffect} from 'react';
import '../App.css';
import {getConvertedBrightnessArray, getInitialBrightnessArray} from "../functions/functionaityCore";


const Canvas = ({file, shift}) => {
    const [image, setImage] = useState(null); // Создаем состояние для хранения изображения
    const [brightnessMatrix, setBrightnessMatrix] = useState([]); // матрица яркости для дальнейшнего определения яркости пикселя по координате

    const [imageSize, setImageSize] = useState({height: 0, width: 0}); // размер изображения

    // Функция для создания изображения из матрицы яркости
    const createImageFromMatrix = () => {
        if (file) { // проверка на загрузку файла
            const reader = new FileReader(); // объект, обладающий возможностями взаимодейтвия с файлами
            reader.onload = function (e) { // обработчик события чтения файла
                let initialColor = getInitialBrightnessArray(e); // создание массива яркости (каждая яркость от 0 до 1023)
                setBrightnessMatrix(initialColor); // назначение матрицы яркости массива созданной выше, для удобвства в дальнейшем использовании

                const selectedOption = parseInt(shift); // выбранный сдвиг
                let convertedColor = getConvertedBrightnessArray(initialColor, selectedOption); // получение матрицы яркости пикселей изображения для дальнейшего построения изображения в RGB

                const imageHeight = convertedColor.length; // высота изображения
                const imageWidth = convertedColor[0].length; // ширина изображения

                setImageSize({height: imageHeight, width: imageWidth}); // назначение размеров изображения в состояние, для отображения в инетрфейсе

                const canvas = document.createElement('canvas'); // создание элемента холста в приложении
                canvas.width = imageWidth; // назначение ширины изображения
                canvas.height = imageHeight; // назначение высоты изображения

                const ctx = canvas.getContext('2d'); // контекст созданного холста для дальнейшего взаимодествия с ним

                const imageData = ctx.createImageData(imageWidth, imageHeight); // создание объекта ImageData с указанымми размерами (все пиксели черные прозрачные при инициализации)

                for (let y = 0; y < imageHeight; y++) { // цикл по высоте изображения
                    for (let x = 0; x < imageWidth; x++) { // уикл по ширине изображения
                        const brightness = convertedColor[y][x]; // яркость пикселя
                        const index = (y * imageWidth + x) * 4; // вычисление индекса для заполнения объекта ImageData

                        imageData.data[index] = brightness.Red; // присваивание красного спектра
                        imageData.data[index + 1] = brightness.Green; // присваивание зеленого спектра
                        imageData.data[index + 2] = brightness.Blue; // присваивание синего спектра
                        imageData.data[index + 3] = 255; // присваивание прозрачности пикселя
                    }
                }
                ctx.putImageData(imageData, 0, 0); // отрисовка данных на холсте начиная с координат (0,0)
                const dataURL = canvas.toDataURL();
                const img = new Image(); // создание элемента изображения
                img.src = dataURL;

                setImage(img);
            };
            reader.readAsArrayBuffer(file);
        }

    }

    // координата наведенного пикселя изображения
    const [hoveredPixelCoordinatesPicture, setHoveredPixelCoordinatesPicture] = useState({x: 0, y: 0});

    // координата наведенного пикселя контейнера, в котором находится изображение
    const [hoveredPixelCoordinatesContainer, setHoveredPixelCoordinatesContainer] = useState({x: 0, y: 0});

    // яркость наведенного пикселя
    const [hoveredPixelBrightness, setHoveredPixelBrightness] = useState(0);


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

    // обработчик события движения курсора по картинке
    const handleMouseMovePicture = (event) => {
        const image = document.getElementById('image'); // ID элемента изображения
        const rect = image.getBoundingClientRect(); // координаты элемента изображения в окне

        const x = Math.floor(Math.max(event.clientX - rect.left, 0));
        const y = Math.floor(Math.max(event.clientY - rect.top, 0));

        setCoordinatesPicture(x, y);
        setBrightness(x, y);
    }

    // обработчик события движения курсора в контейнере
    const handleMouseMoveContainer = (event) => {
        const imageContainer = document.getElementById('pictureContainer'); // ID элемента изображения
        const rect = imageContainer.getBoundingClientRect(); // координаты элемента изображения в окне

        const x = Math.floor(Math.max(event.clientX - rect.left, 0));
        const y = Math.floor(Math.max(event.clientY - rect.top, 0));

        setHoveredPixelCoordinatesContainer({x, y});
    }


    useEffect(() => {
        createImageFromMatrix(); // После получения файла и сдвига или изменения файла/сдвига, создаем изображение
    }, [file, shift]);


    // создание интерфейса
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
            </div>

            {
                image &&
                <div onMouseMove={handleMouseMoveContainer} className="pictureContainer">
                    <div id="pictureContainer" onMouseMove={handleMouseMovePicture} className="pic">
                        <img id="image" src={image.src} alt="Generated Image"/>
                    </div>
                </div>
            }
        </div>

    );
}

export default Canvas;