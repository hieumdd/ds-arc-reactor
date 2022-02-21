import * as dscc from '@google/dscc';

import * as Chart from 'chart.js';
import 'chartjs-plugin-piechart-outlabels';

import * as d3Interpolate from 'd3-interpolate';

import zip from 'lodash-es/zip';

import * as local from './localMessage';

const margin = {
    top: 10,
    bottom: 10,
    right: 10,
    left: 10,
};

const height = dscc.getHeight() - margin.top - margin.bottom;
const width = dscc.getWidth() - margin.left - margin.right;

const canvasElement = document.createElement('canvas');
canvasElement.id = 'chart';
canvasElement.height = height;
canvasElement.width = width;
document.body.appendChild(canvasElement);

const lowestHex = '#ffc3c5';
const lowestRGB = 'rgb(255, 195, 197)';
const highestHex = '#ff0008';
const interpolator = d3Interpolate.interpolateRgb(lowestHex, highestHex);

const itp = (values: number[]) => {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const normalized = values.map((val) => (val - min) / (max - min));
    return normalized.map((val) => interpolator(val));
};

const drawViz = (data: dscc.ObjectFormat) => {
    const ctx = canvasElement.getContext('2d');

    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    const metricValue = zip(
        ...data.tables.DEFAULT.map(({ metricID }) => metricID),
    );
    const metricKey = data.fields.metricID.map(({ name }) => name);

    const datasets = zip(metricKey, metricValue).map(
        ([label, actualData]: [string, number[]], i: number) => ({
            label,
            actualData,
            data: actualData.map(() => 1),
            backgroundColor: actualData.every(
                (i: number) => i === 0 || i === undefined || i === null,
            )
                ? actualData.map(() => lowestRGB)
                : itp(actualData),
            borderWidth: 5,
            outlabels: {
                display: i === 0,
                text: '%l',
                color: 'black',
                backgroundColor: 'white',
                stretch: 45,
                font: {
                    resizable: true,
                    minSize: 12,
                    maxSize: 18,
                },
            },
        }),
    );

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.tables.DEFAULT.map(({ dimID }) => dimID).map(
                ([dimID]) => dimID.toString(),
            ),
            datasets,
        },
        options: {
            cutoutPercentage: 40,
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 50,
                    bottom: 50,
                },
            },
            legend: {
                display: false,
            },
            tooltips: {
                mode: 'nearest',
                intersect: true,
                callbacks: {
                    label({ datasetIndex, index }) {
                        const { label } = datasets[datasetIndex];
                        const value = datasets[datasetIndex].actualData[index];
                        return `${label}: ${value}`;
                    },
                },
            },
        },
    });
};

const LOCAL = true;

if (LOCAL) {
    // @ts-expect-error: Custom Type
    drawViz(local.message);
} else {
    dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}
