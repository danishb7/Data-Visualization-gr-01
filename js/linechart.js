
var Linechart = (function(){

    let svg,
        margin = {top: 20, right: 50, bottom: 30, left: 50},
        width = $("#linechart").width(),
        height = $("#linechart").height();
    
    
    const n = years.length;
        
    const xScale = d3.scaleLinear()
        .domain([0, n-1])
        .range([0, width-100]);


    const xAxisScale = d3.scalePoint()
        .domain(years) // input
        .range([0, width-100]);

    
    const yScale = d3.scaleLinear()
        .range([height-100, 0]);

    const xAxis = d3.axisBottom(xAxisScale)
        .tickValues(xAxisScale.domain().filter((d, i) => !(i % 2)))

    const tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(d => {
                return "<strong>" + d.value.TotalMedals + "</strong> Medals in <strong>" + d.key + "</strong>";
            });

    
    var initialize = function() {
        let line = d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScale(d.value.TotalMedals))
            .curve(d3.curveMonotoneX);

        d3.csv("csv/summer_year_country_event.csv").then(data => {

            data.forEach(d => {
                d.Year = +d.Year;
                d.TotalMedals = (+d.GoldCount + +d.SilverCount + +d.BronzeCount);
            });

            let processedData = d3.nest()
                .key(d => d.Country)
                .key(d => d.Year)
                .rollup(values => {
                    return {
                        "TotalMedals" : d3.sum(values, d => parseFloat(d.TotalMedals)) 
                    };
                })
                .map(data);

            years.forEach(year => {
                if(!(processedData.get(countrySelection[0]).has(year))){
                    processedData.get(countrySelection[0]).set(year, { TotalMedals:0 });
                }
            });

            yScale.domain([0, (d3.max(processedData.get(countrySelection[0]).entries(), d => d.value.TotalMedals + 10 ))]);

            svg = d3.select("#linechart")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(tip);
            
            svg.append("g")
                .attr("class", "xAxis unselectable")
                .attr("transform", "translate(0," + (height - margin.left - margin.top - margin.bottom) + ")")
                .call(xAxis)
                .style("font-size", "12px") 
                

            svg.append("text")
                .attr("class", "axislabel unselectable")
                .attr("transform", "translate(" + ((width / 2) - margin.right) + " ," + 
                                    (height - margin.left - margin.top+30 - margin.bottom) + ")")
                .style("text-anchor", "middle")
                .style("font-size", "16px") 
                .style("font-weight", "bold") 
                .text("Years");

            svg.append("g")
                .attr("class", "yAxis unselectable")
                .call(d3.axisLeft(yScale)) 
                .style("font-size", "12px"); 
            
            svg.append("text")
                .attr("class", "axislabel unselectable")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left + 5)
                .attr("x", 0 - (height / 2) + margin.right)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", "16px") 
                .style("font-weight", "bold") 
                .text("Medals");  

            for(i = 0; i < 4; i++) {
                svg.append("path")
                    .datum(processedData.get(countrySelection[0]).entries().sort(descending))
                    .attr("class", d => "line id" + i + (i == 0 ? "" : " hidden"))
                    .attr("stroke", d => getColor(countrySelection[0]))
                    .attr("d", line);
                
                svg.selectAll(".dot id" + i)
                    .data(processedData.get(countrySelection[0]).entries().sort(descending))
                    .enter().append("circle")
                    .attr("class", d => "dot id" + i + (i == 0 ? "" : " hidden"))
                    .attr("fill", d => d3.rgb(getColor(countrySelection[0])))
                    .attr("cx", (d, i) => xScale(i))
                    .attr("cy", d => yScale(d.value.TotalMedals))
                    .attr("r", 5)
                    .attr("stroke", d => getCSSColor('--main-dark-color'))
                    .attr("opacity", 1);                  
            }
            
        });
    };

    
    var update = function() {
        d3.csv("csv/summer_year_country_event.csv").then(data => {
            data.forEach(d => {
                d.Year = +d.Year;
                d.TotalMedals = (+d.GoldCount + +d.SilverCount + +d.BronzeCount);
            });

            let processedData = d3.nest()
                .key(d => d.Country)
                .key(d => d.Year)
                .rollup(values => {
                    return { 
                        "TotalMedals" : d3.sum(values, d => {
                            switch(currentState) {
                                case 0:
                                    return parseFloat(d.TotalMedals);
                                    break;
                                case 1:
                                    if (d.Sport == sportFilter) { 
                                        return parseFloat(d.TotalMedals);
                                    }
                                    return parseFloat(0);
                                    break;
                                case 2:
                                    if (d.Discipline == disciplineFilter) {
                                        return parseFloat(d.TotalMedals);
                                    }
                                    return parseFloat(0);
                                    break;
                                case 3:
                                    if (d.Event == eventFilter) {
                                        return parseFloat(d.TotalMedals);
                                    }
                                    return parseFloat(0);
                                    break;
                            }
                        })
                    };
                })
            .map(data);
                
            let bestDomain = [0, 1];

            countrySelection.forEach(country => {

                if(country === null){ return; }

                years.forEach(year => {
                    if(!(processedData.get(country).has(year))){
                        processedData.get(country).set(year, { TotalMedals:0 });
                    }
                });

                if(bestDomain[1] < d3.extent(processedData.get(country).entries(), function(d) { return d.value.TotalMedals; })[1]){
                    bestDomain = d3.extent(processedData.get(country).entries(), function(d) { return d.value.TotalMedals; });
                    yScale.domain(bestDomain).nice()
                }
            });

            let lineGenerator = d3.line()
                .x((d, i) => xScale(i))
                .y(d => yScale(d.value.TotalMedals)) 
                .curve(d3.curveMonotoneX);
                
            svg.select(".yAxis")
                .transition().duration(animationTime)
                .ease(d3.easeExp)
                .call(d3.axisLeft(yScale));

            countrySelection.forEach((country, i) => {
                
                if(country === null) { 
                    hideLine(i);
                    return; 
                } 

                svg.select(".line.id" + i)
                    .datum(processedData.get(country).entries().sort(descending))
                    .transition().duration(animationTime)
                    .ease(d3.easeExp)
                    .attr("stroke", d => getColor(country))
                    .attr("d", lineGenerator);

                svg.selectAll(".dot.id" + i)
                    .data(processedData.get(country).entries().sort(descending))
                    .transition()
                    .duration(animationTime)
                    .ease(d3.easeExp)
                    .attr("cy", d => yScale(d.value.TotalMedals))
                    .attr("fill", d => {
                        return (checkIfYearInInterval(d.key) ? 
                            d3.rgb(getColor(country))
                            :  d3.rgb(getColor(country)).brighter());
                    })
                    .attr("opacity", d => (checkIfYearInInterval(d.key) ? 1 : 0.6))
                    .attr("r", d => (checkIfYearInInterval(d.key) ? 5 : 0));

                    showLine(i);
            });
        }) 
    };

    var hideLine = function(lineID) {
        d3.select("#linechart .line.id" + lineID).classed("hidden", true);
        d3.selectAll("#linechart .dot.id" + lineID).classed("hidden", true);
    }

    var showLine = function(lineID) {
        d3.select("#linechart .line.id" + lineID).classed("hidden", false)
        d3.selectAll("#linechart .dot.id" + lineID).classed("hidden", false);
    }

    return {
        initialize:initialize,
        update:update
    };
    
})();

