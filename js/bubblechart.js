Bubblechart = (function() {

    let svg;

    const minBubbleSize = 15,
        maxBubbleSize = 80,
        offsetBetweenBubbles = 5,
        width = $("#bubblechart").width(),
        height = $("#bubblechart").height();


    const radiusScale = d3.scaleSqrt();
        
    const simulation = d3.forceSimulation()
        .force("x", d3.forceX(width).strength(.05).x(width / 2))
        .force("y", d3.forceY(height).strength(.05).y(height / 2))
        .force("center_force", d3.forceCenter().x(width / 2).y(height / 2))
        .force("charge", d3.forceManyBody().strength(10));

    const tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-15, 0])
        .html(d => "<center>" + d[currentFilterKeyword] + "</center>" + "<br>" +
                    "<center>" + 
                    "<font color=#FFD700> <strong>G:" + d.GoldCount   + "</strong> </font>" +
                    "<font color=#C0C0C0> <strong>S:" + d.SilverCount + "</strong> </font>" +
                    "<font color=#cd7f32> <strong>B:" + d.BronzeCount + "</strong> </font>" +
                    "</center>"
        );

    var initialize = function() {
        svg = d3.select("#bubblechart")
            .append("svg")
            .attr("height", height)
            .attr("width", width)
            .append("g")
            .call(tip);
            
        update();
    };

    var update = function() {  
        d3.csv("csv/summer_year_country_event.csv").then(data => {
            data.forEach(d => {
                d.Year = +d.Year;
                d.GoldCount = +d.GoldCount;
                d.SilverCount = +d.SilverCount;
                d.BronzeCount = +d.BronzeCount;
                d.TotalMedals = (+d.GoldCount + +d.SilverCount + +d.BronzeCount);
            });

            let filteredData = data.filter((d, i) => {
                if(countrySelection.includes(d["Country"]) && yearFilter.initial <= d["Year"] && d["Year"] <= yearFilter.end) {
                    switch(currentState) {
                        case 0: 
                            return d;
                            break;

                        case 1: 
                            if(d["Sport"] == sportFilter) {
                                return d;
                            }
                            break;

                        case 2: 
                            if(d["Discipline"] == disciplineFilter) {
                                return d;
                            }
                            break;

                        case 3: 
                            if (d["Event"] == eventFilter) {
                                return d;
                            }
                            break;
                    }
                }
            });

            let processedData = [];

            filteredData.forEach(d => {
                if(processedData.findIndex(x => x[currentFilterKeyword] === d[currentFilterKeyword]) == -1) {
                    processedData[processedData.length] = {
                            "Country" : d.Country, 
                            "Sport" : d.Sport, 
                            "Discipline" : d.Discipline,
                            "Event" : d.Event,
                            "GoldCount" : d.GoldCount, 
                            "SilverCount" : d.SilverCount, 
                            "BronzeCount" : d.BronzeCount, 
                            "TotalMedals" : d.TotalMedals
                        }
                } else {
                    processedData[processedData.findIndex(x => x[currentFilterKeyword] === d[currentFilterKeyword])].GoldCount += d.GoldCount;
                    processedData[processedData.findIndex(x => x[currentFilterKeyword] === d[currentFilterKeyword])].SilverCount += d.SilverCount;
                    processedData[processedData.findIndex(x => x[currentFilterKeyword] === d[currentFilterKeyword])].BronzeCount += d.BronzeCount;
                    processedData[processedData.findIndex(x => x[currentFilterKeyword] === d[currentFilterKeyword])].TotalMedals += d.TotalMedals;
                }
            });

            processedData.sort((a,b) =>  b.TotalMedals < a.TotalMedals);  

            radiusScale
                .domain([1, (d3.max(processedData, d => +d.TotalMedals + offsetBetweenBubbles))])
                .range([minBubbleSize, maxBubbleSize - (processedData.length / 2)]);

            svg.selectAll(".bubble").remove();
            
            var bubblecolor_ = d3.scaleOrdinal(d3.schemeCategory10)

            let bubbleGroup = svg.selectAll(".bubble")
                .data(processedData)
                .enter().append("g")
                .attr("class", "bubble");

            var bubblecolor_ = d3.scaleLinear()
                                    .domain([0,d3.max(function (d){return d.TotalMedals})])
                                    .range(["white","blue"])

            
            const colors = ["#bfe3e6","#b5d6e0","#acc9da","#a2bcd5","#98afcf","#8ea2c9","#8495c3","#7f8fc0","#7583ba","#707db7","#6571b1","#5f6bae","#5a65ab","#4e59a5","#4853a2","#344399","#082d8d"];
            const radiusScale2 = d3.scaleLinear()
                                .domain([minBubbleSize, maxBubbleSize])
                                .range([0, colors.length - 1]);


            const radiusdb = d3.scaleLinear()
                                .domain([1, (d3.max(processedData, d => +d.TotalMedals + offsetBetweenBubbles))])
                                .range([minBubbleSize, maxBubbleSize - (processedData.length / 2)]);

            let bubble = bubbleGroup.append("circle")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", d => radiusScale(d.TotalMedals))
                // .attr("fill", d => eventsColors(Math.random()))
                // .attr("fill", d=> bubblecolor_([d.TotalMedals]))
                // .attr("fill", () => colors[Math.floor(Math.random() * colors.length)])
                .attr("fill", (d, i) => colors[i % colors.length])
                // .attr("fill", d => colors[Math.round(radiusScale2(d.TotalMedals))])
                // .attr("fill", d => bubblecolor_[Math.round(radiusScale2(d.TotalMedals))])
                .attr("stroke", d => getCSSColor('--main-dark-color'))
                .attr("stroke-width", "2")
                .on('mouseover', function(d) {
                    tip.show(d);
                    d3.select(this).transition().duration(animationTime)                  
                        .ease(d3.easeElastic)
                        .attr("stroke", d => getCSSColor('--main-white-color'))
                        .attr("r", d => radiusScale(d.TotalMedals) + offsetBetweenBubbles)
                        .style("cursor", (currentState != 3 ? "pointer" : "default")); 
                    })
                .on('mouseout', function(d){
                    tip.hide(d);
                    d3.select(this).transition().duration(animationTime)
                        .ease(d3.easeElastic)    
                        .attr("stroke", d => getCSSColor('--main-dark-color'))
                        .attr("r", d => radiusScale(d.TotalMedals))
                        .style("cursor", "default"); 
                })
                .on("click", d => {
                    tip.hide(d);
                    selectedNode = d;
                    if(currentState != 3) {
                        updateDashboardState(-1);
                    }
                })
                .call(d3.drag()
                    .on("start", _dragStarted)
                    .on("drag", _dragged)
                    .on("end", _dragEnded));

            
            let labels = bubbleGroup.append("text")
                .attr("class","label unselectable")
                .text(d => {
                    if(radiusScale(d.TotalMedals) < 18) {
                        return "";
                    }
                    if((radiusScale(d.TotalMedals) < 32 && d[currentFilterKeyword].length > 6) 
                        || (radiusScale(d.TotalMedals) < 46 && d[currentFilterKeyword].length > 10)){
                        return  d[currentFilterKeyword].substring(0, 4) + "...";
                    } else {
                        return d[currentFilterKeyword]; 
                    }
                });
                
            d3.select('#back-icon')
                .on('mouseover', function(d) {
                    d3.select(this).transition()
                        .style("cursor", "pointer"); 
                })
                .on('mouseout', function(d) {
                    d3.select(this).transition()
                        .style("cursor", "default"); 
                })
                .on("click", d => updateDashboardState(1));


            simulation.nodes(processedData)
                .force("collide", d3.forceCollide().strength(.5).radius(d => radiusScale(d.TotalMedals) + offsetBetweenBubbles))
                .alpha(1)
                .on('tick', _ticked)
                .restart();

            function _ticked()  {
                bubble
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
                    
                labels
                    .attr("x", d => d.x)
                    .attr("y", d => d.y);
            }
        });
    };

    function _dragStarted(d) {
        tip.hide(d);
        
        if (!d3.event.active) {
            simulation.alphaTarget(.03).restart(); 
        }
        
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function _dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function _dragEnded(d) {
        if (!d3.event.active) { 
            simulation.alphaTarget(.03) 
        };

        d.fx = null;
        d.fy = null;
    }
    return {
        initialize: initialize,
        update: update
    };

})();