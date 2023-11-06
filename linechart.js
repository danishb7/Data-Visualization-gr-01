d3.csv("Participation.csv").then(function(dataset){

    dataset.forEach(function(d){

        d.Year = +d.Year;
        d.M = +d.M;
        d.F = +d.F
    })

    var dimensions = {
        width: 1200,
        height: 500,
        margin:{
            top: 40,
            bottom: 80,
            left: 80,
            right: 40
        }

    }

    var svg =d3.select("#linechart")
                .style("width", dimensions.width)
                .style("height", dimensions.height)

    var xScale = d3.scaleBand()
                    .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
                    .padding(0.2)
            
    var yScale = d3.scaleLinear().range([dimensions.height-dimensions.margin.bottom , dimensions.margin.top])
    
    xScale.domain(dataset.map(function(d) { return d.Year; }))
    yScale.domain([0, d3.max(dataset, d => Math.max(d.M, d.F))])
    // yScale.domain([0,319])

    var line1 = d3.line()
                .x(d=>xScale(d.Year))
                .y(d=>yScale(d.M))
    var line2 = d3.line()
                .x(d=>xScale(d.Year))
                .y(d=>yScale(d.F))

    svg.append("path")
        .data([dataset])
        .attr("class","male")
        .attr("d", line1)
        .attr("fill", "none")
        .attr("stroke","blue")
        .attr("stroke-width",1.5)

    svg.append("path")
        .data([dataset])
        .attr("class","female")
        .attr("d", line2)
        .attr("fill", "none")
        .attr("stroke","#DF077D")
        .attr("stroke-width",1.5)

    var xAxisGen = d3.axisBottom().scale(xScale)
    var xAxis = svg.append("g")
                    .call(xAxisGen)
                    .style("transform", `translateY(${dimensions.height - dimensions.margin.bottom}px)`)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    // .attr("dx", "-.95em")
                    .attr("dy", "1.45em")
                    // .attr("transform", "rotate(-80)" )

    var yAxisGen = d3.axisLeft().scale(yScale).ticks(15)
    var yAxis = svg.append("g")
                    .call(yAxisGen)
                    .style("transform", `translateX(${dimensions.margin.left}px)`)


    svg.append("text")
        .attr("class","x-axis-title")
        .attr("x", 50)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .attr("Year");

    svg.append("text")
        .attr("class", "y-axis-title")
        .attr("x", -220)
        .attr("y",40)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor","middle")
        .text("Number of Athletes");

    const legend = svg.append("g")
        .attr("transform", `translate(${dimensions.width - 150}, 20)`);

    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "blue");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text("Male");

    legend.append("rect")
        .attr("x", 80)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "#DF077D");

    legend.append("text")
        .attr("x", 100)
        .attr("y", 10)
        .text("Female");


})