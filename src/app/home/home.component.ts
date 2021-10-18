import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';

import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';

// setup
const provider = new OpenStreetMapProvider();
const searchControl = GeoSearchControl({
	provider: provider,
  });



@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {

	@ViewChild('myInput') myInputVariable: ElementRef;
	file:any
	map: any
	address: string
	marker:any
	markers = []
	text:string
	smallIcon = new L.Icon({
		iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png',
		iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
		iconSize: [20, 30],
		iconAnchor: [6, 10],
		popupAnchor: [0, -10],
		shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		shadowSize: [10, 10]
	});

	constructor(private http:HttpClient) { }

	ngAfterViewInit(): void {
		this.createMap()	
	}

	createMap(){
		this.map = L.map('mapAddress').setView([0,0],3);
		const mainLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			minZoom: 1,
			maxZoom: 20,
			attribution: 'OSM'
		});
		mainLayer.addTo(this.map);	
		this.map.addControl(searchControl);
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

	getSpacy(){
		this.http.get('http://127.0.0.1:5000/',{params:{text:this.text}}).subscribe(res => console.log(res))
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
