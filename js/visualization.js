var selectedNode = null,
    currentState = 0,   
    countrySelection = [null, null, null, null],
    sportFilter = "All",
    disciplineFilter = "All",
    eventFilter = "All",
    yearFilter = {initial: 1896, end: 2012}
    currentFilterKeyword = "Sport",
    countryNameDictionary = {},
    iocCodeDictionary = {};


const eventsColors = d3.scaleOrdinal(d3.schemeSet3),
    countryColors = ["#FC0000", "#009DFC", "#14B401", "#AAAA0D"];

const years = [1896, 1900, 1904, 1908, 1912, 1920, 1924, 1928, 1932, 1936, 1948, 1952, 1956, 1960, 1964, 1968, 1972, 1976, 1980, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012]

const animationTime = 500;

window.onresize = function(){ location.reload(); }

$(document).ready(function() {

    var callback = $.Deferred();
    loadDictionary(callback);

    callback.done(function() {
        updateDashboardState(0,true);
    });
    
});


function updateDashboardState(nextState, initialUpdate = false) {

    switch(nextState){
        case -1:
            if(++currentState > 3) {
                currentState = 3;
                return;
            }
            break;
        case 1:
            if(--currentState < 0) {
                currentState = 0;
                return;
            }
            break;
    }

    if(initialUpdate) {
        TimeSlider.initialize();

        Bubblechart.initialize();
        WorldMap.initialize();
        Linechart.initialize();

    } else {
        Bubblechart.update();
        Linechart.update();
    }

    let yearsText = 
        (yearFilter.end == yearFilter.initial ? 
            " in <strong>" + yearFilter.initial + "</strong>" :
            " <strong>" +  yearFilter.initial + "</strong> to <strong>" + yearFilter.end + "</strong>"
        );
    let countriesSection = countrySelectionToString();

    switch(currentState) {
        case 0:
            sportFilter = "All";
            currentFilterKeyword = "Sport";
            $('#statelabel').html(
                "Countries: "+countriesSection + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp"+"Event: <strong>All&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</strong>" + "\tYear: "+yearsText
            );
            $('#back-icon-container').hide();
            break;

        case 1:
            sportFilter = selectedNode.Sport;
            currentFilterKeyword = "Discipline";
            $('#statelabel').html(
                "Countries: "+ countriesSection + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp"+"Event: <strong>" + sportFilter + "</strong>" + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspYears: <strong>" + yearsText + "</strong>"
            );
            $('#back-icon-container').show();
            $('#back-subtitle').text("All");
            break;

        case 2:
            disciplineFilter = selectedNode.Discipline;
            currentFilterKeyword = "Event";
            $('#statelabel').html(
                "Countries: " + countriesSection  + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + "Event:  <strong>" + disciplineFilter + "</strong>" + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspYears: <strong>" + yearsText + "</strong>"
            );
            $('#back-subtitle').text(sportFilter);
            break;

        case 3:
            eventFilter = selectedNode.Event;
            currentFilterKeyword = "Event";
            $('#statelabel').html(
                // countriesSection  + " on <strong>" + eventFilter + "</strong>" + yearsText
                "Countries: " + countriesSection  + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + "Event:  <strong>" + eventFilter + "</strong>" + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspYears: <strong>" + yearsText + "</strong>"
            );
            $('#back-subtitle').text(disciplineFilter);
            break;
    }
}


var loadDictionary = function(callback) {
    d3.csv("csv/dictionary.csv").then(function(data){

        data.forEach((element) => {
            countryNameDictionary[element.CountryName] = element.CountryCode;
            iocCodeDictionary[element.CountryCode] = element.CountryName;
        });

         randomizeInitialCountry(data, "ITA");

         callback.resolve();
    })
};


function randomizeInitialCountry(array, initialCountryCode = null) {
    
    let randomCountryCode;
    
    if(initialCountryCode === null) {
        randomCountryCode = array[Math.floor(Math.random() * array.length)].CountryCode;
    } else {
        randomCountryCode = initialCountryCode;
    }

    countrySelection = [randomCountryCode, null, null, null];
}

function convertNameToIOCCode(countryName) {
    if(countryNameDictionary[countryName]) {
        return countryNameDictionary[countryName];
    } else {
        return -1;
    }
}

function convertIOCCodeToName(code) {
    return (iocCodeDictionary[code] ? iocCodeDictionary[code] : -1);
}


function getNumberOfCountriesInSelection() {
	let number = 0;
	countrySelection.forEach((element) => {
		if(element === null) {
            number++;
        }
    });
    
	return countrySelection.length - number;
}


function getFirstOpenPositionInSelection() {
    let n = countrySelection.length;

    for(let i = 0; i < n; i++) {
        if(countrySelection[i] === null) {
            return i;
        }
    };
    
    return -1;
}


function countrySelectionToString() {
    
    let string = "",            
        counter = 0;

    // Cicle through the countries in countrySelection.
    countrySelection.forEach((element, i) => {
		if(element === null) {
            return;
        }

        string += "<strong>" + convertIOCCodeToName(element) + "</strong>";
        counter++;

        switch(getNumberOfCountriesInSelection() - counter) {
            case 0:
                string += "";
                break;

            case 1:
                string += " and ";
                break;

            default:
                string += ", "
                break;
        }
    });
    return string;
}


function changeSelectedCountry(countryName) {
    countrySelection = [String(convertNameToIOCCode(countryName)), null, null, null];

    updateDashboardState(0, false, true);
};

function addCountryToSelection(countryName) {
	countrySelection[getFirstOpenPositionInSelection()] = String(convertNameToIOCCode(countryName));

    updateDashboardState(0);
}

function removeCountryFromSelection(countryName){
	countrySelection[countrySelection.indexOf(String(convertNameToIOCCode(countryName)))] = null;

    updateDashboardState(0);
}

function changeTimeline(begin, end){
    if(yearFilter.initial != years[Math.round(begin)] || yearFilter.end != years[Math.round(end)]) {
        yearFilter.initial = years[Math.round(begin)];
        yearFilter.end = years[Math.round(end)];
    
        updateDashboardState(0);
    }
};

function checkIfTimelineIsBetween(begin, end){
    return (begin <= yearFilter.initial && end >= yearFilter.initial && begin <= yearFilter.end &&  end >= yearFilter.end);
}

function checkIfYearInInterval(year){
    return (year >= yearFilter.initial && year <= yearFilter.end);
};

function getCSSColor(variable){
    return getComputedStyle(document.body).getPropertyValue(variable);
};

function descending(a,b) { return a.key - b.key };


function getColor(countryCode) {
    var index =  countrySelection.findIndex(el => el === countryCode);

    return ((index == -1) ? "D2D4D3" : countryColors[index]);
}