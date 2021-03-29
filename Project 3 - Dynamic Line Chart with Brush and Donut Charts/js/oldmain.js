/*
*    main.js
*    Mastering Data Visualization with D3.js
*    CoinStats
*/

// GLOBALS
let currency = "bitcoin";  // bitcoin / bitcoin_cash / ehtereum / litecoin / ripple
let value; // market_cap / price_usd / 24h_vol
let minDate;
let maxDate;
let minDateSliderRange;
let maxDateSliderRange;
let minVal;
let maxVal;
let filteredData;

var formatSi = d3.format(".2s");
function formatAbbreviation(x) {
    var s = formatSi(x);
    switch (s[s.length - 1]) {
        case "G": return s.slice(0, -1) + "B";
        case "k": return s.slice(0, -1) + "K";
    }
    return s;
}

var margin = { left:80, right:100, top:50, bottom:100 },
    height = 500 - margin.top - margin.bottom, 
    width = 800 - margin.left - margin.right;

// Date Parser
var parseTime = d3.timeParse("%d/%m/%Y");

// For tooltip
var bisectDate = d3.bisector(d => d.year).left;

// Scales
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Axis generators
var xAxisCall = d3.axisBottom();

var yAxisCall = d3.axisLeft()
    // .ticks(6)
    .tickFormat(d => formatAbbreviation(d));

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + 
        ", " + margin.top + ")");

// Append Line for first time
g.append("path")
    .attr("class", "line")
    .attr("fill", "black")
    .attr("stroke", "gray")
    .attr("stroke-with", "3px");
        

// Axis groups
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

var yAxis = g.append("g")
    .attr("class", "y axis");
    

//#region LABELS

// Y-Axis label
yAxis.append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "#5D6971")
    .text(value);

// X-Axis label
xAxis.append("text")
    .attr("class", "axis-title")
    .attr("transform", `translate(${width/2 + 25}, 40)`)
    .style("text-anchor", "end")
    .attr("fill", "black")
    .style("font-size", "3rem")
    .text("Time");

//#endregion

// ======================== jQuery =====/

// SLIDER


// /======================== jQuery =====

// Line path generator
var line = d3.line()
    .x(d => {
        return x(parseTime(d.date));
    })
    .y(d => y(d[value]));


let graphLine;

$("#coin-select")
.on("change", update);

$("#value-select")
.on("change", update);


d3.json("http://localhost:9999/coins.json").then(function(data) {
    
    //#region  Data cleaning
    filteredData = Object.keys(data)
        .map(curr => {
            return {
                [curr]: data[curr].filter(x => x["24h_vol"] != null && x.market_cap != null && x.price_usd != null).map(x => {
                    return {...x,
                        market_cap: Number(x.market_cap),
                        price_usd: Number(x.price_usd),
                        ["24h_vol"]: Number(x["24h_vol"])}
                })
            }
        });

    filteredData = {...filteredData[0], ...filteredData[1], ...filteredData[2], ...filteredData[3], ...filteredData[4]};

    console.log("mindate inside of then promise:: :", d3.min(filteredData.bitcoin, d => parseTime(d.date)));

    let initialSliderMinDate = d3.min(filteredData[currency], d => parseTime(d.date)).getTime() / 1000;
    let initialSliderMaxDate = d3.max(filteredData[currency], d => parseTime(d.date)).getTime() / 1000;

    $("#date-slider").slider({
        range: true,
        min: initialSliderMinDate,
        max: initialSliderMaxDate,
        values: [initialSliderMinDate, initialSliderMaxDate],
        slide: function( event, ui ) {
            $( "#amount" ).val( (new Date(ui.values[ 0 ] *1000).toDateString() ) + " - " + (new Date(ui.values[ 1 ] *1000)).toDateString() );
            update();
        }
      });

      

    
    // #endregion
    update();
    
});



function update(){
    const t = d3.transition().duration(100)

    currency = $("#coin-select").val();
    value = $("#value-select").val();

    console.log("!!!!!!!!!!!UPDATE!!!!!!!!!!!")

    console.log("data inside of update: ", filteredData);
    console.log("currency: ", currency);
    console.log("filteredData[currency]: ", filteredData[currency]);

    // depending on the currency: change min/max and the two values of the slider to reflect them 




    // maxDate = d3.max(filteredData[currency], d => parseTime(d.date));
    // console.log("maxdate: ", maxDate);
    // minDate = d3.min(filteredData[currency], d => parseTime(d.date));
    // console.log("mindate: ", minDate);

    minDate = new Date($("#date-slider").slider("values")[0] * 1000);
    
    maxDate = new Date($("#date-slider").slider("values")[1] * 1000);

    console.log("minDate: ", minDate, "maxDate: ", maxDate);

    // get domains from slider and then update 

    maxVal = (d3.max(filteredData[currency], d => d[value]));
    minVal = (d3.min(filteredData[currency], d => d[value]));



    // Set scale domains 
    x.domain([minDate, 
        maxDate]);

    console.log("parsedmax", parseTime(maxDate));
    

    console.log(minVal, maxVal);

    y.domain([minVal, maxVal]);

    // Generate axes once scales have been set
    xAxis.transition(t).call(xAxisCall.scale(x))
    yAxis.transition(t).call(yAxisCall.scale(y))

    let line = d3.line()
    .x(d => {
        return x(parseTime(d.date));
    })
    .y(d => y(d[value]));

    // Add line to chart
    // g.append("path")
    // .datum(filteredData[currency])
    // .attr("class", "line")
    // .attr("fill", "none")
    // .attr("stroke", "gray")
    // .attr("stroke-with", "3px")
    // .attr("d", line);

    /******************************** Tooltip Code ********************************/

    var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", width);

    focus.append("circle")
        .attr("r", 7.5);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

    g.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); });
    //     .on("mousemove", mousemove);

    // function mousemove() {
    //     var x0 = x.invert(d3.mouse(this)[0]),
    //         i = bisectDate(data, x0, 1),
    //         d0 = data[i - 1],
    //         d1 = data[i],
    //         d = x0 - d0.year > d1.year - x0 ? d1 : d0;
    //     focus.attr("transform", "translate(" + x(d.year) + "," + y(d.value) + ")");
    //     focus.select("text").text(d.value);
    //     focus.select(".x-hover-line").attr("y2", height - y(d.value));
    //     focus.select(".y-hover-line").attr("x2", -x(d.year));
    // }



    /******************************** Tooltip Code ********************************/

    line = d3.line()
		.x(d => x(parseTime(d.date)))
		.y(d => y(d[value]))

	// Update our line path
	g.select(".line")
		.transition(t)
		.attr("d", line(filteredData[currency]))


}
