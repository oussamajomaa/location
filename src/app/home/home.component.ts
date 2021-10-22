import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';

import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';

const provider = new OpenStreetMapProvider();
const searchControl = GeoSearchControl({
	provider: provider,
});

import Geocoder  from 'leaflet-control-geocoder';
// import Geocoder from 'leaflet-control-geocoder';


@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {

	@ViewChild('myInput') myInputVariable: ElementRef;
	file: any
	map: any
	address: string
	marker: any
	markers = []
	text: string
	smallIcon = new L.Icon({
		iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png',
		iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
		iconSize: [20, 30],
		iconAnchor: [6, 10],
		popupAnchor: [0, -10],
		shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		shadowSize: [10, 10]
	});

	constructor(private http: HttpClient) { }

	ngAfterViewInit(): void {
		this.createMap()
	}

	createMap() {
		this.map = L.map('mapAddress').setView([0, 0], 3);
		const mainLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			minZoom: 1,
			maxZoom: 20,
			attribution: 'OSM'
		});
		mainLayer.addTo(this.map);

		const Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
			maxZoom: 20,
			attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
		});

		const OpenStreetMap_France = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
			maxZoom: 20,
			attribution: '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		});

		const OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
			maxZoom: 17,
			attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
		});

		const Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
		});
		
		const Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
			maxZoom: 16
		});
		// leaflet layer control
		const baseMaps = {

			'Stadia_AlidadeSmooth': Stadia_AlidadeSmooth,
			'OpenStreetMap_France': OpenStreetMap_France,
			'OpenTopoMap':OpenTopoMap,
			'Esri_WorldImagery':Esri_WorldImagery,
			'Esri_NatGeoWorldMap':Esri_NatGeoWorldMap
		}



		var marker = L.markerClusterGroup()
		const overlayMaps = {
			'GeoJson Markers':marker
		}
		
		L.control.layers(baseMaps).addTo(this.map)


		const GeocoderControl = new Geocoder();
		GeocoderControl.addTo(this.map);
		GeocoderControl.on('markgeocode', function (e) {
		console.log(e)
		})
		// const geocoder = new Geocoder()
		// geocoder.addTo(this.map)
		// this.map.addControl(searchControl);

	}

	async searchAddress() {

		console.log(this.address)
		// search
		const results = await provider.search({ query: this.address });
		console.log(results);

		results.map(location => {
			console.log(location.raw.lat);

			this.marker = L.marker([parseInt(location.raw.lat), parseInt(location.raw.lon)], { icon: this.smallIcon })
			this.marker.addTo(this.map).bindPopup(`<center><h3>${location.label}</h3>`)

		})

	}

	getSpacy() {
		this.http.get('http://127.0.0.1:5000/', { params: { text: this.text } }).subscribe(res => console.log(res))
	}

	fileUpload(e) {

		this.file = e.target.files[0];
		let fileReader = new FileReader();
		fileReader.onload = () => {
			this.text = fileReader.result as string
		}
		fileReader.readAsText(this.file);
	}





}
