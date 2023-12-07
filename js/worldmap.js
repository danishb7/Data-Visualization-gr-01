
var WorldMap = (function(){
    
    const MAX_SELECTED_COUNTRIES = 4;

    const ALERT_MESSAGE = "You can't select more countries!\nTo start a new group from scratch try Control + Left Click"
    const NOT_SELECTED_COUNTRY_COLOR = "#A8A39D"

    const width = 2400,
        height = 1000;

    let svg;
    
   
    var initialize = function() {
        
        let minZoom,
            maxZoom,
            midX,
            midY,
            currentX,
            currentY,
            currentZoom;
    
        
        let projection = d3.geoMercator()
            .center([0, 20]) 
            .scale([width / (2 * Math.PI)]) 
            .translate([width / 2, height / 2]); 
    
        let path = d3.geoPath()
            .projection(projection);
    
        let zoom = d3.zoom()
            .on("zoom", zoomed);
    
        let c = document.getElementById('worldmap'),
            offsetL = c.offsetLeft+20,
            offsetT = c.offsetTop+10,
            tooltip = d3.select("#worldmap").append("div").attr("class", "tooltip hidden");
    
        function initiateZoom() {
            minZoom = Math.max( 2 * $("#worldmap").width() / width, 2 * $("#worldmap").height() / height);
    
            maxZoom = 20 * minZoom;
    
            midX = ($("#worldmap").width() - (minZoom * width)) / 2;
            midY = ($("#worldmap").height() - (minZoom * height)) / 2;
            zoom
                .scaleExtent([minZoom, 10 * minZoom])
                .translateExtent([[0, 0], [width, height]]);
    
            svg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
        }
        $(window).resize(function () {
            svg.attr("width", $("#worldmap").width())
              .attr("height", $("#worldmap").height());
    
            initiateZoom();
        });
    
        var svg = d3.select("#worldmap")
            .append("svg")
            .attr("width", $("#worldmap").width()-4)
            .attr("height", $("#worldmap").height()-4)
            .attr("fill", "rgb(255,255,255)")
            
            .call(zoom);
    
        function getTextBox(selection) {
            selection.each(function (d) { d.bbox = this.getBBox(); })
        }
        
        svg.append('defs')
            .append('pattern')
            .attr('id', 'diagonalHatch')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 4)
            .attr('height', 4)
            .append('path')
            .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
            .attr('stroke', '#000000')
            .attr('stroke-width', 2.5);
        
        d3.json("js/worldmap/simple_map.json").then(function (json) {
            countriesGroup = svg.append("g")
                .attr("id", "map");
    
            countries = countriesGroup.selectAll("path")
                .data(json.features).enter()
                .append("path")
                .attr("d", path)
                .attr("stroke", "#121D1F")
                .attr("class", function (d) {
                    if(convertNameToIOCCode(d.properties.name_long) == -1) 
                        return "non-selectable-country";
                    else {
                        if(convertNameToIOCCode(d.properties.name_long) == countrySelection[0]) {
                            return "country country-on";
                        } else {
                            return "country";
                        }
                    }
                })
                .attr("fill", function(d) {
                    if (d3.select(this).classed("non-selectable-country")) {
                        return "url(#diagonalHatch)";
                    } if (d3.select(this).classed("country country-on")) {
                        return getColor(convertNameToIOCCode(d.properties.name_long));
                    } else {
                        return NOT_SELECTED_COUNTRY_COLOR;
                    }
                })
                .on("mouseover", function (d) {
                    d3.select(this).attr("stroke", function() { return getCSSColor('--main-white-color') })
                        .style("cursor", function(d) {
                            if(d3.select(this).classed("non-selectable-country")) {
                                return "default";
                            } else {
                                return "pointer";
                            }
                        });

                    this.parentElement.appendChild(this);
    
                    let mouseCoordinates = d3.mouse(svg.node()).map(function(d) { 
                        return parseInt(d); 
                    });
                    
                    tooltip.classed("hidden", false)
                        .attr("style", "left:"+(mouseCoordinates[0]+offsetL)+"px;top:"+(mouseCoordinates[1]+offsetT)+"px")
                        .html(d.properties.name);
                })
                .on("mouseout", function (d) {
                    d3.select(this).attr("stroke", function() 
                        { return getCSSColor('--main-dark-color') 
                    });
    
                    tooltip.classed("hidden", true)
                        .style("cursor", "default");
                })
                .on("click", function (d) {
                    if (d3.select(this).classed("country")) {
                        if(d3.event.ctrlKey) {
                            if (d3.select(this).classed("country-on")) {
                                zoomOut();
                            }
                            else {
                                d3.selectAll(".country").classed("country-on", false)
                                    .attr("fill", function(d) {
                                    return NOT_SELECTED_COUNTRY_COLOR;
                                });
    
                                d3.select(this).classed("country-on", true);
                                   
                                boxZoom(path.bounds(d), path.centroid(d), 20);
                                
                                // Change country first so fill color can be correctly updated
                                changeSelectedCountry(d.properties.name_long);

                                d3.select(this).attr("fill", function(d) {
                                    return getColor(convertNameToIOCCode(d.properties.name_long));
                                });
                            }
                        }
                        if (!(getNumberOfCountriesInSelection() == 1 
                          && countrySelection.includes(convertNameToIOCCode(d.properties.name_long)))) {
                            if(d3.select(this).classed("country-on")) {
                                d3.select(this).classed("country-on", false)
                                    .attr("fill", function(d) {
                                    return NOT_SELECTED_COUNTRY_COLOR;
                                });
    
                                removeCountryFromSelection(d.properties.name_long);
                            }
                            else {
                                if (getNumberOfCountriesInSelection() < MAX_SELECTED_COUNTRIES) {
                                    addCountryToSelection(d.properties.name_long);
                                    d3.select(this).classed("country-on", true)
                                        .attr("fill", function(d) {
                                            return getColor(convertNameToIOCCode(d.properties.name_long));
                                        });
                                } else {
                                    alert(ALERT_MESSAGE);
                                }
                            }
                        }
                    }
                });
            initiateZoom();
        });
    
        function zoomed() {
            t = d3.event.transform;
            countriesGroup.attr(
                "transform", "translate(" + [t.x, t.y] + ")scale(" + t.k + ")"
            );   
        }
    
        function zoomOut() {
            svg.transition()
                .duration(500)
                .call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
        };
    
        function boxZoom(box, centroid, paddingPerc) {
            let svg_width = $("#worldmap").width() - 10;
            let svg_height = $("#worldmap").height() - 10;
            
            minXY = box[0];
            maxXY = box[1];
            
            zoomWidth = Math.abs(minXY[0] - maxXY[0]);
            zoomHeight = Math.abs(minXY[1] - maxXY[1]);
            
            zoomMidX = centroid[0];
            zoomMidY = centroid[1];
            currentX = centroid[0];
            currentY = centroid[1];
            
            zoomWidth = zoomWidth * (1 + paddingPerc / 100);
            zoomHeight = zoomHeight * (1 + paddingPerc / 100);
    
            maxXscale = svg_width / zoomWidth;
            maxYscale = svg_height / zoomHeight;
            zoomScale = Math.min(maxXscale, maxYscale);
            
            zoomScale = Math.min(zoomScale, maxZoom);
            
            zoomScale = Math.max(zoomScale, minZoom);
            
            offsetX = zoomScale * zoomMidX;
            offsetY = zoomScale * zoomMidY;
    
            dleft = Math.min(0, svg_width / 2 - offsetX);
            dtop = Math.min(0, svg_height/ 2 - offsetY);
            
            dleft = Math.max(svg_width - width * zoomScale, dleft);
            dtop = Math.max(svg_height - height * zoomScale, dtop);
            currentZoom = zoomScale;
            svg.transition()
                .duration(500)
                .call(zoom.transform,d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale));
        }
    }

    return {
        initialize:initialize
    };

})();

