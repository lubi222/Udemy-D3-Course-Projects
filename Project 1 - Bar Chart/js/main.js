/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    Project 1 - Star Break Coffee
 */

let data = [
    {
        month: "January",
        revenue: "13432",
        profit: "8342",
    },
    {
        month: "February",
        revenue: "19342",
        profit: "10342",
    },
    {
        month: "March",
        revenue: "17443",
        profit: "15423",
    },
    {
        month: "April",
        revenue: "26342",
        profit: "18432",
    },
    {
        month: "May",
        revenue: "34213",
        profit: "29434",
    },
    {
        month: "June",
        revenue: "50321",
        profit: "45343",
    },
    {
        month: "July",
        revenue: "54273",
        profit: "47452",
    },
];

data.forEach((d) => {
    d.revenue = +d.revenue;
    d.profit = +d.profit;
});

var margin = { left: 100, right: 10, top: 10, bottom: 100 };

let width = 800;
let height = 600;

let usingRevenue = true;

let t = d3.transition().duration(750);

let svg = d3
    .select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top);

// X Label
svg.append("text")
    .attr("class", "x axis-label")
    .attr("x", width / 2 + margin.left)
    .attr("y", height + margin.bottom)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("The world's tallest buildilngs");

// Y Label
let yLabel = svg
    .append("text")
    .attr("class", "y axis-label")
    .attr("x", -(height / 2))
    .attr("y", margin.left - 60)
    .attr("font-size", "20px")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("height (m)");

// Apply Margin
var g = svg.append("g").attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// X Scale
var xScale = d3.scaleBand().range([0, width]).paddingInner(0.2).paddingOuter(0.2);

// Y Scale
var yScale = d3.scaleLinear().range([height, 0]);

// X Axis
var xAxisCall = d3.axisBottom(xScale);

var yAxisCall = d3.axisLeft(yScale).tickFormat((d) => {
    return "$" + d;
});

// X Axis Text
let xAxisGroup = g
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0, " + height + ")")
    .call(xAxisCall);

// Y Axis Text
let yAxisGroup = g.append("g").attr("class", "y-axis").call(yAxisCall);

d3.interval(() => {
    let newData = !usingRevenue ? data : data.slice(1);
    update(newData);
    usingRevenue = !usingRevenue;
    console.log("updated");
}, 1000);

update(data);

function update(data) {
    let source = usingRevenue ? "revenue" : "profit";

    // Change Domain depending on data
    xScale.domain(data.map((d) => d.month));
    yScale.domain([0, d3.max(data, (x) => x[source])]);

    // X Axis
    xAxisGroup.transition(t).call(xAxisCall);

    // Y Axis
    yAxisGroup.transition(t).call(yAxisCall);

    // Bars

    // JOIN new data with old elements.
    let rects = g.selectAll("rect").data(data, (d) => d.month);

    // EXIT old elements not present in new data.
    rects.exit().attr("fill", "red").transition(t).attr("y", yScale(0)).attr("height", 0).remove();

    // UPDATE old elements present in new data.
    rects
        .transition(t)
        .attr("y", (d) => yScale(d[source]))
        .attr("x", (d) => xScale(d.month))
        .attr("height", (d) => height - yScale(d[source]))
        .attr("width", xScale.bandwidth);

    // ENTER new elements present in new data.
    rects
        .enter()
        .append("rect")
        .attr("fill", "grey")
        .attr("y", yScale(0))
        .attr("height", 0)
        .attr("x", (d) => xScale(d.month))
        .attr("width", xScale.bandwidth)
        .transition(t)
        .attr("y", (d) => yScale(d[source]))
        .attr("height", (d) => height - yScale(d[source]));

    let yLabelText = usingRevenue ? "Revenue" : "Profit";
    yLabel.text(yLabelText);
}
