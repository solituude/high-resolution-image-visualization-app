import './App.scss'; //импорт стилей для компонентов

import React, {useState} from "react";
import Canvas from "./Canvas/Canvas";
import {getBarLabels} from "./functions/functionaityCore";

function App() {
    const [currentFile, setCurrentFile] = useState(null); // файл, загруженный в систему и функция назначения файла
    const [selectedShift, setSelectedShift] = useState("0"); // выбранный сдвиг и функция назначения сдвига

    // обработчик события добавления файла
    const handleAddFile = (event) => {
        setCurrentFile(event.target.files[0]); // присвоение значению текущего файла файла загруженного в систему
    }

    // обработчки события выбора сдвига
    const handleChooseShift = (event) => {
        setSelectedShift(event.target.value); // назначение сдвига
    }
    const barLabels = getBarLabels();

    // графический интерфейс приложения
    return (
        <div>
            <div className="settings">
                <form className="input-file__form">
                    <input type="file" id="fileInput" onChange={handleAddFile} accept=".mbv" className="input__item"/>
                </form>

                <form id="shiftForm" onChange={handleChooseShift} className="input-radio__form">
                    <span>Сдвигать коды на: </span>
                    <div className="input-radio__item">
                        <input type="radio" id="shiftZero" name="shift" value="0" checked={selectedShift === "0"}/>
                        <label htmlFor="shiftZero">0</label>
                    </div>

                    <div className="input-radio__item">
                        <input type="radio" id="shiftOne" name="shift" value="1" checked={selectedShift === "1"}/>
                        <label htmlFor="shiftZero">1</label>
                    </div>

                    <div className="input-radio__item">
                        <input type="radio" id="shiftTwo" name="shift" value="2" checked={selectedShift === "2"}/>
                        <label htmlFor="shiftZero">2</label>
                    </div>
                </form>
            </div>
            <Canvas barLabels={barLabels} file={currentFile} shift={selectedShift}/>
        </div>
    );
}

export default App;
