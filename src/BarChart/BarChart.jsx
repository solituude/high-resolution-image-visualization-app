import React, {useEffect, useState} from "react";
import {Bar} from "react-chartjs-2";
import {
    getBorderData,
    getConvertedBrightnessArray,
    getHistogram,
    getPartBrightnessArray
} from "../functions/functionaityCore";
import RangeSlider from "../RangeSlider/RangeSlider";
import {CategoryScale, Chart as ChartJS} from 'chart.js';
import Chart from 'chart.js/auto';


const BarChart = ({barLabels, convertedBrightness, yMin, setValue, value, selectedOption}) => {
    const [barData, setBarData] = useState([]);
    const [currentValue, setCurrentValue] = useState({min: 0, max: 255});
    const borderData = getBorderData(currentValue.min, currentValue.max);


    useEffect(() => {
        // console.log(convertedBrightness);
        let currentBrightness = getConvertedBrightnessArray(convertedBrightness, selectedOption);
        currentBrightness = getPartBrightnessArray(currentBrightness, yMin);
        // console.log(currentBrightness);
        if (convertedBrightness.length !== 0){
            setBarData(getHistogram(currentBrightness));
        }
    }, [convertedBrightness, yMin]);

    const data = {
        labels: barLabels,
        datasets: [
            {
                label: "Количество пикселей",
                data: barData,
                backgroundColor: "rgba(139, 173, 234, 1)",
            },
            {
                label: "Границы",
                data: borderData,
                borderColor: "#000",
                backgroundColor: "#000"
            }
        ],

    };

    const chartOptions = {
        maintainAspectRatio: false,
        animation: false,
        scales: {
            y: {
                display: true,
                title: {
                    display: true,
                    text: "Количество пикселей"
                },
                max: 1000,
                ticks: {
                    stepSize: 100,
                    reverse: true,

                },
            },
            x: {
                display: true,
                title: {
                    display: true,
                    text: "Яркость пикселей"
                },
                ticks: {
                    stepSize: 15,
                    reverse: true,
                },
                offset: true,
            },
        },
        plugins: {
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    font: {
                        size: 14
                    }
                }
            }
        },
    };

    return(
        <div style={{width: "400px", height: "300px"}}>
            <Bar data={data} options={chartOptions}/>
            <div className={"range__container"}>
                <div className={"gradient"}/>
                <RangeSlider min={0} max={255} step={1} value={currentValue} onChange={setCurrentValue} />

                <div className="left-right__container">
                    <span>L:<span>{currentValue.min}</span></span>
                    <span>R:<span>{currentValue.max}</span></span>
                </div>

            </div>
            <button onClick={() => setValue(currentValue)} style={{margin: "10px 60px"}}>
                Применить
            </button>
        </div>
    )
}

export default BarChart;