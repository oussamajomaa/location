import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { AfterViewInit, Component } from '@angular/core';
import { DataService } from '../services/data.service';
import * as L from 'leaflet';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';

const provider = new OpenStreetMapProvider();
const searchControl = GeoSearchControl({
	provider: provider,
});

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
	mainLayer: any

	constructor(
		private dataService:DataService,
		private http:HttpClient,
		private route:ActivatedRoute,
		private toastService: ToastrService,
		) {
	 }

	ngAfterViewInit(): void {
		// Récupérer tous les pays et les stocker dans une listes countries
		this.dataService.getCountries()
		.subscribe((res:any) => {
			this.countries = res
			this.loading = true
		})	
		// fin ** Récupératin tous les pays **
		this.createMap()
		this.getLatLng()
		
	}

	createMap(lat = 0, lng = 0, z = 2) {
		this.map = L.map('mapLocation').setView([lat, lng], z);

		this.mainLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			minZoom: 1,
			maxZoom: 20,
			attribution: 'OSM'
		});
		this.mainLayer.addTo(this.map);
		this.map.addControl(searchControl);

		
	}

	getLatLng(){
		this.map.on('click', (e)=>{
			this.lat = (e.latlng.lat).toFixed(4)
			this.lng = (e.latlng.lng).toFixed(4)
			
		})
	}

	onAddLocation(){
		// Récupérer l'id du pays
		let id
		this.countries.map(country => {	
			if (country.country === this.country){
				id = country.id
				return id
			}
		})
		this.id_country = id
		// fin ** Récupératin l'id du pays **
		
		// Construire un objet location et 'insérer dans la list locations
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
		// fin ** Insértion de l'objet **
	}

	removeCity(city){
		// Supprimer un objet (location) de la liste locations
		this.locations = this.locations.filter(location => {
			return location.city != city
		})
	}

	onSubmit(){
		// Itération de la liste locations et envoyer chaque élément à la BDD
		console.log(this.locations);
		this.locations.map(location => {
			this.http.post(`${environment.url}/add-city`,location)
			.subscribe(res => res)
		})
		this.toastService.success("Les lieux ont été ajoutés!!!");
		this.locations = []
	}


	csvToRowArray:any
	csv = []
	uploadCSV(e){
		let file = e.target.files[0]
		let fileReader = new FileReader();
    	fileReader.onload = (e) => {
     
			this.csvToRowArray = fileReader.result
			let allTextLines = [];
			allTextLines = this.csvToRowArray.split(/\r|\n|\r/);
			allTextLines.shift()
			console.log(allTextLines);
			allTextLines.map((element:any) => {
				let arr = element.split(',')
				if (arr.length >1){
					let item = {
						city:arr[0],
						country:arr[1],
						lat:arr[2],
						lng:arr[3]
					}

					this.csv.push(item)
				}
				
			})
			console.log("csv array ",this.csv);
			this.locations = this.csv
			
		}
    	fileReader.readAsText(file);
		// https://therichpost.com/how-to-read-csv-file-in-angular-10/
	}
	

}
