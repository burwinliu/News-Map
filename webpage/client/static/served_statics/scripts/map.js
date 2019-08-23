import {Map, View} from 'ol';
import {fromLonLat, transform} from 'ol/proj'
import {GeoJSON} from "ol/format";
import VectorLayer from 'ol/layer/Vector';
import {Fill, Style} from "ol/style";
import VectorSource from "ol/source/Vector";
import {$} from 'jquery';
/*
    Data for countries.geojson from https://github.com/datasets/geo-countries
        All data is licensed under the Open Data Commons Public Domain Dedication and License.
        Note that the original data from Natural Earth is public domain. While no credit is formally required a link
        back or credit to Natural Earth, Lexman and the Open Knowledge Foundation is much appreciated.
        All source code is licenced under the MIT licence.
*/


/*
    Meant to retrieve data from db
 */
console.log("0.0.2.1.5");
const tableInner = '<tr><th scope="col">Headline</th><th scope="col">URL</th></tr>';
const colours = JSON.parse(a);
let load_in = false;
let opened_side = false;

// Views
const mapView = new View({
    center: fromLonLat([37.41, 8.82]),
    zoom: 4,
    maxZoom: 7,
    minZoom: 2,
});

// Styles
function countryStyle(feature){
    let style;
    if(feature.get("ISO_A2") in colours) {
        style = new Style({
            fill: new Fill({
                color: colours[feature.get("ISO_A2")],
            })
        });
    }
    else{
        // TODO still need to either delete countries that arent showing up on both ends, or just ignoring them -- or unifying?
        //  maybe create own countries database and adding in extra iso codes
        style = new Style({
            fill: new Fill({
                color: 'white',
            })
        });
    }
    return style;
}


// Layers
const countryLayer = new VectorLayer({
    source: new VectorSource({
        format: new GeoJSON(),
        url: "/static/data/countries.geojson"
    }),
    style: countryStyle
});

// Map declaration
const map = new Map({
    target: 'map',
    layers: [
        countryLayer
    ],
    view: mapView
});

map.on('rendercomplete', e => {
    if(!load_in){
        document.getElementById('preloader').classList.toggle('fade');
        document.getElementById('main-page').classList.toggle('show');
        load_in = true;
    }
});

map.on('click', async function(event) {
    map.forEachFeatureAtPixel(event.pixel, async function(feature) {
        const url='/data?iso=' + feature.get("ISO_A2");
        let response = await fetch(url,);
        let json = await response.json();
        let key;
        const tableRef = document.getElementById('table');
        tableRef.innerHTML = tableInner;
        for(key in json){
            const headline = key;
            const url = json[key];
            const newRow   = tableRef.insertRow(tableRef.rows.length);
            const headlineCell = newRow.insertCell(0);
            const urlCell  = newRow.insertCell(1);
            const urlText  = document.createTextNode(url);
            const headlineText  = document.createTextNode(headline);
            urlCell.appendChild(urlText);
            headlineCell.appendChild(headlineText);
        }
        if(!opened_side){
            opened_side = true;
            document.getElementById('sidebar').classList.toggle('active');
        }

    });
});

