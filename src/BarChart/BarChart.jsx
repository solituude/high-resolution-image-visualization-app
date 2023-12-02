import React, {useEffect, useState} from "react";
import {Bar} from "react-chartjs-2";
import {getHistogram, getPartBrightnessArray} from "../functions/functionaityCore";
import RangeSlider from "../RangeSlider/RangeSlider";
import {CategoryScale, Chart as ChartJS} from 'chart.js';
import Chart from 'chart.js/auto';


const BarChart = ({barLabels, convertedBrightness, yMin, setValue, value}) => {
    const [barData, setBarData] = useState([]);

    useEffect(() => {
        const currentBrightness = getPartBrightnessArray(convertedBrightness, yMin);
        if (convertedBrightness.length !== 0){
            setBarData(getHistogram(currentBrightness));
        }
    }, [convertedBrightness, yMin]);

    const data = {
        labels: barLabels,
        datasets: [
            {
                label: "1",
                data: barData,
            }
        ],
        borderColor: "#000",
    };

    const chartOptions = {
        maintainAspectRatio: false,
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
    };

    return(
        <div style={{width: "400px", height: "300px"}}>
            <Bar data={data} options={chartOptions}/>
            <div className={"range__container"}>
                <RangeSlider min={0} max={255} step={1} value={value} onChange={setValue} />
                <span>L:<span>{value.min}</span></span>
                <span>R:<span>{value.max}</span></span>
            </div>
        </div>
    )
}

export default BarChart;