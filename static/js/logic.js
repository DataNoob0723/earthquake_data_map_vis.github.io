function buildUrl() {
    const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
    const boundaryURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
    return [boundaryURL, earthquakeUrl]
}

function createFeatures(boundaryData, earthquakeData) {

    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.properties.mag),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    function getColor(mag){
        let color = "white";
        if (mag <= 1){
            color = "#98ee00";
        }
        if (mag > 1 && mag <= 2){
            color = "#d4ee00";
        }
        if (mag > 2 && mag <= 3){
            color = "#eecc00";
        }
        if (mag > 3 && mag <= 4){
            color = "#ee9c00";
        }
        if (mag > 4 && mag <= 5){
            color = "#ea822c";
        }
        if (mag > 5){
            color = "#ea2c2c";
        }
        return color
    }

    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 3;
    }

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the mag and place
    function onEachFeature(feature, layer) {
        layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    const earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: onEachFeature
    });

    const boundaries = L.geoJSON(boundaryData, {
        color: "orange",
        weight: 2
    });

    // Sending our earthquakes layer to the createMap function
    createMap(boundaries, earthquakes);
}

function createMap(boundaries, earthquakes) {

    // Define 3 different layers
    const lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    const satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    const outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    const baseMaps = {
        Satellite: satellitemap,
        Greyscale: lightmap,
        Outdoors: outdoormap
    };

    // Create overlay object to hold our overlay layer
    const overlayMaps = {
        "Fault Lines": boundaries,
        "Earthquakes": earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    const myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 3,
        layers: [satellitemap, boundaries, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create legends

    let legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");

        let grades = [0, 1, 2, 3, 4, 5];
        // let colors = ["lawngreen", "yellowgreen", "gold", "orange", "darkorange", "tomato"];
        let colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"
        ];

        for (let i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
                grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };
    legend.addTo(myMap);

}


(async function(){
    //const queryUrl = buildUrl();
    let urlArray = buildUrl();
    boundaryURL = urlArray[0];
    earthquakeUrl = urlArray[1];
    const bddata = await d3.json(boundaryURL);
    const eqdata = await d3.json(earthquakeUrl);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(bddata.features, eqdata.features);

})();