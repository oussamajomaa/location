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
	country=''
	city=''
	lat:number
	lng:number
	map:any
	id_country:number
	geojson: any

	constructor(private dataService:DataService, private http:HttpClient) { }

	ngAfterViewInit(): void {
		this.dataService.getCountries()
		.subscribe((res:any) => {
			this.countries = res
			this.loading = true
		})	

		
	}

	onAddLocation(){
		console.log('hello');
		
		const location = {
			country:this.country,
			city:this.city,
			lat:this.lat,
			lng:this.lng,
			id_country:this.id_country
		}
		this.locations.push(location)
		this.country=null
		this.city=null
		this.lat=null
		this.lng=null
		console.log(this.locations);
		
	}

	removeCity(city){
		console.log(city);
		
		this.locations = this.locations.filter(location => {
			return location.city != city
		})
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

	

}
