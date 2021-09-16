import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../services/data.service';
import { v4 as uuid } from 'uuid';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
	map:any
	locations = []
	country=''
	countries = []
	coords = []
	marker:any
	markers = []
	loading=false

	smallIcon = new L.Icon({
		iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png',
		iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
		iconSize:    [20, 30],
		iconAnchor:  [6, 10],
		popupAnchor: [0, -10],
		shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		shadowSize:  [10, 10]
	  });

	constructor(private http:HttpClient, private dataService:DataService) { }

	ngAfterViewInit(): void {
		this.dataService.getLocation().subscribe((res:any) => {
			console.log(res)
			this.locations = res
			this.locations.map(location => {
				if (!this.countries.find(country => country === location.country)){
					this.countries.push(location.country)
					this.countries = this.countries.sort()
					this.loading = false
				}
				
			})
			this.loading = true
		})
		
		this.createMap();
		// const word = "osm"
		// var input ="Bonjour OSM, comment vas-tu. osm va Osm très bien, merci. osmosm";
		// var regex = new RegExp("\\b"+word+"\\b")
		// var found = input.match(new RegExp(regex,'gi'))
		// console.log(found)
	}

	createMap(){
		
		this.map = L.map('map', {
			center: [ 0, 0],
			zoom: 2
		});
	  
		const mainLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			minZoom: 1,
			maxZoom: 20,
			attribution: 'OSM'
		});
	  
		mainLayer.addTo(this.map);	
	}


	changeCity(){
		if (this.markers.length>0) {
			this.markers.map(marker => this.map.removeLayer(marker))
		}
		this.coords = this.locations.filter(res => res.country === this.country)
		this.coords.map(location => {
			this.marker = L.marker([location.lat, location.lng],{ icon: this.smallIcon })
			this.marker.addTo(this.map).bindPopup(location.city)
			this.markers.push(this.marker)
		})
	}

}
