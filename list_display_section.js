import { createChart } from './chartFunctions.js';
const Stocks = ['AAPL','MSFT','GOOGL','AMZN','PYPL','TSLA','JPM','NVDA','NFLX','DIS'];
const listSection = document.querySelector(".list-section");
const displaySection = document.querySelector(".display-section");


async function getDetails() {
    const response1 = await fetch(`https://stocks3.onrender.com/api/stocks/getstockstatsdata`);
    const user1 = await response1.json();
    const [bookValue_ProfitObj] = user1.stocksStatsData;  //it is a bookvalue and profit object shows bookvalue and profit for each stock


    const response2 = await fetch(`https://stocks3.onrender.com/api/stocks/getstocksprofiledata`);
    const user2 = await response2.json();
    const [summaryObj] = user2.stocksProfileData; //it is a summary object shows summary for each stock

    document.querySelector(".container").style.display = "block";

    Stocks.forEach((stock)=>{
        createList(stock,bookValue_ProfitObj,summaryObj);
    })
    createDisplaySection('AAPL', bookValue_ProfitObj, summaryObj);
    createChart('AAPL', '5y');
}


function createList(stock, bookValue_ProfitObj, summaryObj) {
    const liItem = document.createElement("div");
    liItem.classList.add("list_item");
    const stockName = document.createElement("button");
    stockName.classList.add("stockName_button");
    stockName.textContent = `${stock}`;
    const bookValue = document.createElement("span");
    bookValue.textContent = `$${bookValue_ProfitObj[stock].bookValue}`;
    const profit = document.createElement("span");
    profit.textContent = `${bookValue_ProfitObj[stock].profit.toFixed(2)}%`;
    profit.style.color = parseFloat(profit.textContent) > 0 ? "#90EE90" : "red";
    liItem.append(stockName,bookValue,profit);
    listSection.appendChild(liItem);
    stockName.addEventListener("click",()=>{
        createDisplaySection(stockName.textContent,bookValue_ProfitObj,summaryObj);
        createChart(stockName.textContent,'5y');
    });
}


function createDisplaySection(stock, bookValue_ProfitObj, summaryObj) {
    displaySection.textContent = "";
    const div = document.createElement("div");
    const stockName = document.createElement("span");
    stockName.textContent = `${stock}`;
    stockName.id = "stockName";
    const bookValue = document.createElement("span");
    bookValue.id ="bookValue";
    bookValue.textContent = `$${bookValue_ProfitObj[stock].bookValue}`;
    const profit = document.createElement("span");
    profit.id = "profit";
    profit.textContent = `${bookValue_ProfitObj[stock].profit}%`;
    profit.style.color = parseFloat(profit.textContent) > 0 ? "green" : "red";
    div.append(stockName,profit,bookValue);
    displaySection.appendChild(div);
    const summary = document.createElement("p");
    summary.innerHTML = `${summaryObj[stock].summary}`;
    displaySection.appendChild(summary);
}

export { getDetails, createList, createDisplaySection };
