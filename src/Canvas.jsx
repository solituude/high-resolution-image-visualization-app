import React, {useState, useEffect} from 'react';
import './App.css';
import {getConvertedBrightnessArray, getInitialBrightnessArray} from "./functions/functionaityCore";
import {ca} from "wait-on/exampleConfig";

const Canvas = ({file, shift}) => {
    const [image, setImage] = useState(null); // Создаем состояние для хранения изображения
    const [brightnessMatrix, setBrightnessMatrix] = useState([]); // матрица яркости для дальнейшнего определения яркости пикселя по координате

    const [imageSize, setImageSize] = useState({height: 0, width: 0}); // размер изображения

    // Функция для создания изображения из матрицы яркости
    const createImageFromMatrix = () => {
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                let initialColor = getInitialBrightnessArray(e);
                setBrightnessMatrix(initialColor);

                const selectedOption = parseInt(shift);
                let convertedColor = getConvertedBrightnessArray(initialColor, selectedOption);

                const imageHeight = convertedColor.length;
                const imageWidth = convertedColor[0].length;

                setImageSize({height: imageHeight, width: imageWidth});

                const canvas = document.createElement('canvas');
                canvas.width = imageWidth;
                canvas.height = imageHeight;

                const ctx = canvas.getContext('2d');

                const imageData = ctx.createImageData(imageWidth, imageHeight);

                for (let y = 0; y < imageHeight; y++) {
                    for (let x = 0; x < imageWidth; x++) {
                        const brightness = convertedColor[y][x];
                        const index = (y * imageWidth + x) * 4;

                        imageData.data[index] = brightness.Red;
                        imageData.data[index + 1] = brightness.Green;
                        imageData.data[index + 2] = brightness.Blue;
                        imageData.data[index + 3] = 255;
                    }
                }
                ctx.putImageData(imageData, 0, 0);
                const dataURL = canvas.toDataURL();
                const img = new Image();
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
                        <td>Y(ЗК):</td>
                        <td className={"coordinates__item"}>{hoveredPixelCoordinatesPicture.y}</td>
                    </tr>
                    <tr>
                        <td>Y(матрица):</td>
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