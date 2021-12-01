import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';

import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';

const provider = new OpenStreetMapProvider();
const searchControl = GeoSearchControl({
	provider: provider,
});

import Geocoder from 'leaflet-control-geocoder';
import { DataService } from '../services/data.service';
import { environment } from 'src/environments/environment';
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
	places = []
	fileName = '';
	
	smallIcon = new L.Icon({
		iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png',
		iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
		iconSize: [20, 30],
		iconAnchor: [6, 10],
		popupAnchor: [0, -10],
		shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		shadowSize: [10, 10]
	});

	constructor(
		private http: HttpClient,
		private dataService:DataService
		) { }

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
			'OpenTopoMap': OpenTopoMap,
			'Esri_WorldImagery': Esri_WorldImagery,
			'Esri_NatGeoWorldMap': Esri_NatGeoWorldMap
		}



		var marker = L.markerClusterGroup()
		const overlayMaps = {
			'GeoJson Markers': marker
		}

		L.control.layers(baseMaps).addTo(this.map)


		const GeocoderControl = new Geocoder();
		// GeocoderControl.addTo(this.map);
		GeocoderControl.on('markgeocode', function (e) {
			console.log(e)
		})
		// const geocoder = new Geocoder()
		// geocoder.addTo(this.map)
		// this.map.addControl(searchControl);

	}

	async findPlace(places:[{word:"",label:""}]){
		if (places.length > 0) {
			places.map(place =>{
				provider.search({ query: place.word })
				.then(res => {
					console.log('res**  ',res)
					res.map(r => this.places.push(r))
					this.places.push(res)

				})
				// console.log('results  ',results);
			})
		}
	}

	async searchAddress() {
		this.places = []
		if (this.markers.length > 0) {
			this.markers.map(marker => this.map.removeLayer(marker))
			console.log('delete');

		}
		// this.markers = []

		console.log(this.address)
		// search
		if (this.address) {
			const results = await provider.search({ query: this.address });
			console.log('results',results);

			// results.map(location => {
			// 	let place = {
			// 		label: location.label,
			// 		lat:location.x,
			// 		lng:location.y,
			// 	}
			// 	this.places.push(place)
			// 	this.marker = L.marker([location.y, location.x], { icon: this.smallIcon })
			// 	this.marker.addTo(this.map).bindPopup(`<center><h3>${location.label}</h3>`)
			// 	this.markers.push(this.marker)

			// })
			
			
			// if (this.markers.length > 0) {
			// 	const group = L.featureGroup(this.markers);
			// 	this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
			// }

		}
		console.log('places **',this.places);
		console.log('markers ',this.markers);
	}

	
	locations:any = []
	sendText() {
		this.http.get(`${environment.url_py}/text`, { params: { text: this.text } })
		.subscribe((res:any) => {
			this.locations = res
			
			this.locations = res.filter(location => {
				return location.label ==='LOC'
				
			})
			console.log(this.locations);
			// this.findPlace(this.locations)	
		})
	}

	sendFile(){
		if (this.file){
			const formData = new FormData()
			formData.append('file',this.file,this.file.name)
			this.dataService.sendFile(formData).subscribe(res => console.log('sent success'))
		}
	}

	// fileUpload(e) {
	// 	this.file = e.target.files[0];
	// 	let fileReader = new FileReader();
	// 	fileReader.onload = () => {
	// 		this.text = fileReader.result as string
	// 	}
	// 	fileReader.readAsText(this.file);
	// }

	// dataURItoBlob(base64: any) {
	// 	let binary = atob(base64.split(',')[1]);
	// 	let array = [];
	// 	for (let i = 0; i < binary.length; i++) {
	// 		array.push(binary.charCodeAt(i));
	// 	}
	// 	return new Blob([new Uint8Array(array)], { type: 'text' });
	// }

	
	onFileSelected(event) {
        const file:File = event.target.files[0];
        if (file) {
            this.fileName = file.name;
            const formData = new FormData();
			formData.append("name", file.name);
            formData.append("file", file,file.name);
			this.http.post(`${environment.url_py}/file`, formData).subscribe((res:any)=>{

				console.log(res)
			})
        }
    }

	clearText(){
		this.text = ""
	}

	

}
