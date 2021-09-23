import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { DataService } from '../services/data.service';
import * as L from 'leaflet';


@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements AfterViewInit {
	locations = []
	countries = []
	cities = []
	loading=false
	country:string=''
	city:string=''
	lat:number
	lng:number
	map:any
	id_country:number

	constructor(private dataService:DataService, private http:HttpClient) { }

	ngAfterViewInit(): void {
		this.createMap()
		this.map.on("click", e => {
			this.lat = e.latlng.lat
			this.lng = e.latlng.lng
			console.log(e.latlng.lat);
		});
		this.dataService.getCountries()
		.subscribe((res:any) => {
			this.countries = res
			this.loading = true

			// this.countries.map(res => {
			// 	this.http.post('http://localhost:5000/modify',res)
			// 	.subscribe(response => console.log(response))
			// })
		})	
		
		
	}

	createMap(){
		this.map = L.map('mapLocation').setView([0,0],3);
		const mainLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			minZoom: 1,
			maxZoom: 20,
			attribution: 'OSM'
		});
		mainLayer.addTo(this.map);	
	}

	onSubmit(){
		const location = {
			country:this.country,
			city:this.city,
			lat:this.lat,
			lng:this.lng,
			id_country:this.id_country
			
		}
		console.log(location);
		
	}

	onChangeCountry(event){
		this.id_country = event.value
		console.log(this.id_country);
		
	}

}
