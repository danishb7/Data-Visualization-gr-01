// import * as d3Collection from 'd3-collection';
d3.csv("Olympics.csv").then(function(dataset){

    var dimensions = {
        width: 1300,
        height: 575,
        margin:{
            top: 40,
            bottom: 80,
            right: 40,
            left: 80
        }
    }

    var svg = d3.select("#linechart")
                .style("width", dimensions.width)
                .style("height", dimensions.height)


    var xScale = d3.scaleBand()
    .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
    .padding(0.15)

    var yScale = d3.scaleLinear().range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])

    // var countbygender = {};
// check if data or dataset
    // data.forEach(entry => {
    //         if (!countbygender[entry.Year]){
    //             countbygender[entry.Year] = {};
    //         }
    //         if (countbygender[entry.Year][entry.Sex]){
    //             countbygender[entry.Year][entry.Sex] = 0;
    //         }
    //         countbygender[entry.Year][entry.Sex]++;
    //         }
    //     )

    const countbygender = d3.nest()
            .key(d => d.Year)
            .key(d => d.Sex)
            .rollup(values => values.length)
            .entries(dataset);


    // const countbygender = d3.nest()
    //                         .key(d => d.Year)
    //                         .key(d => d.Sex)
    //                         .rollup(values => values.length)
    //                         .entries(dataset)

    xScale.domain(dataset.map(function(d) { return d.year; }));
    yScale.domain([0, d3.max(countbygender.flatMap(d => d.values), d => d.value)])

    var line= d3.line()
                .x(d => xScale(d.Year))
                .y(d => yScale(d.value))

    // const color = {M:"blue", F:"pink"};

    // Object.entries(countbygender).forEach(([year, genderdata]) => {
    //     Object.entries(genderdata).forEach(([sex,count]) =>{
    
    countbygender.forEach((genderData,index)=>{
        const color = index == 0? "blue" : "pink";    
        svg.append("path")
            .data ([genderData.values])
            .attr("class", "line")
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 4);

        svg.selectAll("circle")
            .data(genderData.values)
            .enter().append("circle")
            .attr("cx", d => xScale(d.Year))
            .attr("cy", d => yScale(d.value))
            .attr("r", 8)
            .attr("fill", color);
        
    });
    
    
    
    

})