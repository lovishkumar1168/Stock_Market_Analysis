const oneMonthBtn = document.getElementById("1-month");
const threeMonthsBtn = document.getElementById("3-months");
const oneYearBtn = document.getElementById("1-year");
const fiveYearsBtn = document.getElementById("5-years");
const chartLabelElement = document.querySelector('.chart-tooltip');
let verticalLine = null;

oneMonthBtn.addEventListener("click", () => {
    chartLabelElement.innerHTML = "";
    createChart(stockName.textContent, '1mo');
});

threeMonthsBtn.addEventListener("click", () => {
    chartLabelElement.innerHTML = "";
    createChart(stockName.textContent, '3mo');
});

oneYearBtn.addEventListener("click", () => {
    chartLabelElement.innerHTML = "";
    createChart(stockName.textContent, '1y');
});

fiveYearsBtn.addEventListener("click", () => {
    chartLabelElement.innerHTML = "";
    createChart(stockName.textContent, '5y');
});

async function fetchData() {
    try {
        const response = await fetch(`https://stocks3.onrender.com/api/stocks/getstocksdata`);
        if (!response.ok) {
            throw new Error("error occured");
        }
        const data = await response.json();
        const [chartsData] = data.stocksData;
        return chartsData;
    } catch (err) {
        console.log(err);
    }
}

function processData(company, timePeriod, stockData) {
    const data = stockData[company][timePeriod];
    const labels = [];
    const values = data.value;

    let peakValue = values[0];
    let lowestValue = values[0];

    const localizedDates = data.timeStamp.map(timestamp => {
        labels.push(new Date(timestamp * 1000).toLocaleDateString());
        return labels[labels.length - 1];
    });

    for (let i = 1; i < values.length; i++) {
        if (values[i] > peakValue) {
            peakValue = values[i];
        }
        if (values[i] < lowestValue) {
            lowestValue = values[i];
        }
    }

    return {
        labels: localizedDates,
        data: values,
        peakValue: peakValue,
        lowestValue: lowestValue
    };
}

let stockChart = null;
async function createChart(company, timePeriod = '5y') {
    const data = await fetchData();
    const processedData = processData(company, timePeriod, data);

    let ctx = document.getElementById('stockChart').getContext('2d');
    if (stockChart) {
        stockChart.destroy();
    }
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [...processedData.labels],
            datasets: [{
                label: `${company}(${timePeriod})  lowest Value : ${processedData.lowestValue.toFixed(2)}   peak Value : ${processedData.peakValue.toFixed(2)}`,
                data: [...processedData.data],
                borderColor: 'green',
                borderWidth: 3,
                pointRadius: 0,
                fill: false,
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    enabled: false, // Disable tooltips
                },
            },
            interaction: {
                intersect: false,
                mode: 'index',
                axis: 'x' // Only trigger hover events on the x-axis
            },
            scales: {
                x: {
                    display: false // Initially hide x-axis labels
                },
                y: {
                    display: false // Initially hide y-axis labels
                }
            }
        }
    });

    let chartContainer = document.getElementById('chart');
    if (verticalLine) {
        verticalLine.remove(); // Remove the previous vertical line if it exists
    }
    verticalLine = document.createElement('div');
    verticalLine.style.position = 'absolute';
    verticalLine.style.width = '1px';
    verticalLine.style.height = '100%';
    verticalLine.style.backgroundColor = 'white';
    verticalLine.style.pointerEvents = 'none';
    verticalLine.style.zIndex = '10';

    const chartContainerRect = chartContainer.getBoundingClientRect();
    const chartContainerLeft = chartContainerRect.left + window.pageXOffset;
    const chartContainerTop = chartContainerRect.top + window.pageYOffset;
    chartContainer.appendChild(verticalLine);

    ctx.canvas.addEventListener('mousemove', function (evt) {
        const activePoint = stockChart.getElementsAtEventForMode(evt, 'index', { intersect: false });
        if (activePoint && activePoint.length) {
            stockChart.options.plugins.tooltip.enabled = false; // Hide the black line
            verticalLine.style.display = 'block'; // Show the white line
            const hoverIndex = activePoint[0].index;
            const dateString = new Date(processedData.labels[hoverIndex]);
            const date = new Date(dateString);
            const formattedDate = (date.getMonth() + 1).toString().padStart(2, '0') + '/' + date.getDate().toString().padStart(2, '0') + '/' + date.getFullYear().toString().substring(2);
            const value = parseFloat(processedData.data[hoverIndex]).toFixed(2);
            stockChart.options.scales.x.display = true; // Show x-axis labels
            stockChart.options.scales.x.ticks = {
                callback: function (value, index, values) {
                    // Display custom date label only for the hovered index
                    if (index === hoverIndex) {
                        return formattedDate;
                    }
                }
            };
            chartLabelElement.textContent = `${company}: ${value}`;
            chartLabelElement.style.left = evt.pageX + 'px';
            chartLabelElement.style.top = evt.pageY + 'px';
            chartLabelElement.style.display = 'block';
            chartLabelElement.style.fontWeight = 'bold'

            // Calculate the y position relative to the chart container
            let y = evt.clientY - chartContainerTop;
            y = Math.max(0, Math.min(y, chartContainerRect.height - 1000));
            verticalLine.style.top = chartContainerTop - y + 'px';
            verticalLine.style.height = chartContainerRect.height - y + 'px'; // Set the height of the line to match the height of the chart container

            const x = evt.clientX - chartContainerLeft; // Calculate x position relative to the chart container
            verticalLine.style.left = x + 'px';
            verticalLine.style.top = y + 'px';
            
            stockChart.update();
        } else {
            stockChart.options.scales.x.display = false;
            stockChart.options.scales.x.title = {
                display: false
            };
            stockChart.options.plugins.tooltip.enabled = false;

            // Ensure the white line is hidden
            verticalLine.style.display = 'none';
            stockChart.update();
        }
    });
}

export { fetchData, processData, createChart };