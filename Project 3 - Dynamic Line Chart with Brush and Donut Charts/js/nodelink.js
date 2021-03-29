let svg = d3.select("svg");
let width = +svg.attr("width");
let height = +svg.attr("height");

let color = d3.scaleOrdinal(d3.schemeCategory20);

let simulation = d3
    .forceSimulation()
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("collide", d3.forceCollide(10).strength(0.9))
    .force(
        "link",
        d3.forceLink().id((d) => d.id)
    );

d3.json("http://localhost:9999/miserables.json", (error, data) => {
    if (error) throw error;

    console.log("Raw data: ", data);

    console.log("Data: Links: ", data.links);
    console.log("Data: Nodes: ", data.nodes);

    // Add lines for every link in the dataset
    let link = svg
        .append("g")
        .attr("class", "links")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke-width", (d) => Math.sqrt(d.value));

    // Add circles for every node in the dataset
    let node = svg
        .append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .attr("class", "nodes")
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("fill", (d) => color(d.group))
        .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

    // Basic tooltips
    node.append("title").text((d) => d.id);

    // Attach nodes to the simulation, add listener on the "tick" event
    simulation.nodes(data.nodes).on("tick", ticked);

    // Associate the lines with the "link" force
    simulation.force("link").links(data.links);

    // Dynamically update the position of the nodes/links as time passes
    function ticked() {
        link.attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    }
});

// Change the value of alpha, so things move around when we drag a node
function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.7).restart();
    d.fx = d.x;
    d.fy = d.y;
}

// Fix the position of the node that we are looking at
function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

// Let the node do what it wants again once we've looked at it
function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
