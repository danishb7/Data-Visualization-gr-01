const data = [
    { name: 'Category 1', value: 100 },
    { name: 'Category 2', value: 150 },
    { name: 'Category 3', value: 80 },
    { name: 'Category 4', value: 120 },
    { name: 'Category 5', value: 200 }
];

const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

const xScale = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, width])
    .padding(0.1);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height, 0]);

const g = svg.append("g");

g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.name))
    .attr("y", d => yScale(d.value))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(d.value));

g.selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => xScale(d.name) + xScale.bandwidth() / 2)
    .attr("y", d => yScale(d.value) - 5)
    .attr("text-anchor", "middle")
    .text(d => d.value);