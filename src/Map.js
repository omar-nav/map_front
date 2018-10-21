import React, { Component } from 'react';
import L from 'leaflet';
// postCSS import of Leaflet's CSS
import 'leaflet/dist/leaflet.css';
// using webpack json loader we can import our geojson file like this
import geojson from 'json!./municipios.geojson';
// import local components Filter and ForkMe
import Filter from './Filter';

// store the map configuration properties in an object,
// we could also move this to a separate file & import it if desired.
let config = {};
config.params = {
  center: [40.655769, -73.938503],
  zoomControl: false,
  zoom: 13,
  maxZoom: 19,
  minZoom: 11,
  scrollwheel: false,
  legends: true,
  infoControl: false,
  attributionControl: true
};
config.tileLayer = {
  uri: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
  params: {
    minZoom: 11,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoib21hci1uYXZhcnJvIiwiYSI6ImNpanN2ZWZxZzBoa291eWx4ZWdsajl1OGIifQ.SH4OG9811nirTGJ3rE4DHw'
  }
};

// array to store unique names of Brooklyn subway municipioss,
// this eventually gets passed down to the Filter component
let nombresDeMunicipios = [];

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      tileLayer: null,
      geojsonLayer: null,
      geojson: null,
      nombreDeMunicipiosFilter: '*',
      numEntrances: null
    };
    this._mapNode = null;
    this.updateMap = this.updateMap.bind(this);
    this.onEachFeature = this.onEachFeature.bind(this);
    this.pointToLayer = this.pointToLayer.bind(this);
    this.filterFeatures = this.filterFeatures.bind(this);
    this.filterGeoJSONLayer = this.filterGeoJSONLayer.bind(this);
  }

  componentDidMount() {
    // code to run just after the component "mounts" / DOM elements are created
    // we could make an AJAX request for the GeoJSON data here if it wasn't stored locally
    this.getData();
    // create the Leaflet map object
    if (!this.state.map) this.init(this._mapNode);
  }

  componentDidUpdate(prevProps, prevState) {
    // code to run when the component receives new props or state
    // check to see if geojson is stored, map is created, and geojson overlay needs to be added
    if (this.state.geojson && this.state.map && !this.state.geojsonLayer) {
      // add the geojson overlay
      this.addGeoJSONLayer(this.state.geojson);
    }

    // check to see if the subway municipioss filter has changed
    if (this.state.nombreDeMunicipiosFilter !== prevState.nombreDeMunicipiosFilter) {
      // filter / re-render the geojson overlay
      this.filterGeoJSONLayer();
    }
  }

  componentWillUnmount() {
    // code to run just before unmounting the component
    // this destroys the Leaflet map object & related event listeners
    this.state.map.remove();
  }

  getData() {
    // could also be an AJAX request that results in setting state with the geojson data
    // for simplicity sake we are just importing the geojson data using webpack's json loader
    this.setState({
      numEntrances: geojson.features.length,
      geojson
    });
  }

  updateMap(e) {
    let nombreDeMunicipio = e.target.value;
    // change the subway municipios filter
    if (nombreDeMunicipio === "todas las alcaldías") {
      nombreDeMunicipio = "*";
    }
    // update our state with the new filter value
    this.setState({
      nombreDeMunicipiosFilter: nombreDeMunicipio
    });
  }

  addGeoJSONLayer(geojson) {
    // create a native Leaflet GeoJSON SVG Layer to add as an interactive overlay to the map
    // an options object is passed to define functions for customizing the layer
    const geojsonLayer = L.geoJson(geojson, {
      onEachFeature: this.onEachFeature,
      pointToLayer: this.pointToLayer,
      filter: this.filterFeatures
    });
    // add our GeoJSON layer to the Leaflet map object
    geojsonLayer.addTo(this.state.map);
    // store the Leaflet GeoJSON layer in our component state for use later
    this.setState({ geojsonLayer });
    // fit the geographic extent of the GeoJSON layer within the map's bounds / viewport
    this.zoomToFeature(geojsonLayer);
  }

  filterGeoJSONLayer() {
    // clear the geojson layer of its data
    this.state.geojsonLayer.clearLayers();
    // re-add the geojson so that it filters out subway municipioss which do not match state.filter
    this.state.geojsonLayer.addData(geojson);
    // fit the map to the new geojson layer's geographic extent
    this.zoomToFeature(this.state.geojsonLayer);
  }

  zoomToFeature(target) {
    // pad fitBounds() so features aren't hidden under the Filter UI element
    var fitBoundsParams = {
      paddingTopLeft: [200, 10],
      paddingBottomRight: [10, 10]
    };
    // set the map's center & zoom so that it fits the geographic extent of the layer
    this.state.map.fitBounds(target.getBounds(), fitBoundsParams);
  }

  filterFeatures(feature, layer) {
    // filter the subway entrances based on the map's current search filter
    // returns true only if the filter value matches the value of feature.properties.LINE
    const test = feature.properties.LINE.indexOf(this.state.nombreDeMunicipiosFilter);
    if (this.state.nombreDeMunicipiosFilter === '*' || test !== -1) {
      return true;
    }
  }

  pointToLayer(feature, latlng) {
    // renders our GeoJSON points as circle markers, rather than Leaflet's default image markers
    // parameters to style the GeoJSON markers
    var markerParams = {
      radius: 4,
      fillColor: 'orange',
      color: '#fff',
      weight: 1,
      opacity: 0.5,
      fillOpacity: 0.8
    };

    return L.circleMarker(latlng, markerParams);
  }

  onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.LINE) {

      // if the array for unique subway municipios names has not been made, create it
      // there are 19 unique names total
      if (nombresDeMunicipios.length < 15) {

        // add subway municipios name if it doesn't yet exist in the array
        feature.properties.LINE.split('-').forEach(function (municipios, index) {
          if (nombresDeMunicipios.indexOf(municipios) === -1 && nombresDeMunicipios.LINE !== "todas las alcaldías") {
            nombresDeMunicipios.push(municipios);
          }
        });

        // on the last GeoJSON feature
        if (this.state.geojson.features.indexOf(feature) === this.state.numEntrances - 1) {
          // use sort() to put our values in alphanumeric order
          nombresDeMunicipios.sort();
          // finally add a value to represent all of the municipioss
          nombresDeMunicipios.unshift('todas las alcaldías');
        }
      }



      // assemble the HTML for the markers' popups (Leaflet's bindPopup method doesn't accept React JSX)
      const popupContent = `<h3>${feature.properties.LINE}</h3>
        <h4><strong>Robos durante 2015: </strong>${feature.properties.robbery2015_Total}</h4>
        <h4><strong>Robos durante 2016: </strong>${feature.properties.robbery2016_Total}</h4>
        <h4><strong>Robos durante 2017: </strong>${feature.properties.robbery2017_Total}</h4>
        <h4><strong>Homicidios durante 2015: </strong>${feature.properties.homicides2015_Total}</h4>
        <h4><strong>Homicidios durante 2016: </strong>${feature.properties.homicides2015_Total}</h4>
        <h4><strong>Homicidios durante 2017: </strong>${feature.properties.homicides2017_Total}</h4>`;

      // add our popups
      layer.bindPopup(popupContent);
    }
  }

  init(id) {
    if (this.state.map) return;
    // this function creates the Leaflet map object and is called after the Map component mounts
    let map = L.map(id, config.params);
    L.control.zoom({ position: "bottomleft" }).addTo(map);
    L.control.scale({ position: "bottomleft" }).addTo(map);

    // a TileLayer is used as the "basemap"
    const tileLayer = L.tileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(map);

    // set our state to include the tile layer
    this.setState({ map, tileLayer });
  }

  render() {
    const { nombreDeMunicipiosFilter } = this.state;
    return (
      <div id="mapUI">
        {
          /* render the Filter component only after the nombreDeMunicipios array has been created */
          nombresDeMunicipios.length &&
          <Filter municipioss={nombresDeMunicipios}
            curFilter={nombreDeMunicipiosFilter}
            filterLines={this.updateMap} />
        }
        <div ref={(node) => this._mapNode = node} id="map" />
      </div>
    );
  }
}

export default Map;
