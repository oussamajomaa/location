import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

	@ViewChild('myInput') myInputVariable: ElementRef;

	map:any
	locations = []
	country=''
	countries = []
	coords = []
	marker:any
	markers = []
	loading=false
	geojson:any
	text:string
	foundCities = []
	foundCountries = []
	file:any;
	msg:string
	polyline:any
	cities = []
	ids=[]

	smallIcon = new L.Icon({
		iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png',
		iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
		iconSize:    [20, 30],
		iconAnchor:  [6, 10],
		popupAnchor: [0, -10],
		shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		shadowSize:  [10, 10]
	});

	constructor(private dataService:DataService, private http:HttpClient) { }

	ngAfterViewInit(): void {
		
		this.dataService.getLocation().subscribe((res:any) => {
			this.locations = res
		})
		this.dataService.getCountries()
		.subscribe((res:any) => {
			this.countries = res
			
			this.loading = true
		})	
	}

	createMap(lat,lng,z){
		this.map = L.map('map', {
			center: [ lat, lng],
			zoom: z
		});
	  
		const mainLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			minZoom: 1,
			maxZoom: 20,
			attribution: 'OSM'
		});
		mainLayer.addTo(this.map);	
		L.layerGroup().addTo(this.map)
		// https://www.youtube.com/watch?v=ax--7KkM_io	
	}


	changeCountry(){
		// supprimer l'ancienne carte
		if (this.map) this.map.remove()

		// supprimer les anciens markers
		if (this.markers.length>0) {
			this.markers.map(marker => this.map.removeLayer(marker))
		}

		// filtrer les coordonnées selon un pays choisi
		this.coords = this.locations.filter(res => res.country === this.country)

		// créer la carte 
		this.createMap(this.coords[0]['lat'],this.coords[0]['lng'],4)
		this.geoJson('assets/data/countries.json',this.country)

	}

	geoJson(url:string,country:string){
		this.http.get(url).subscribe((res:any) => {
			this.geojson = res
			this.geojson = this.geojson.features.filter(data => data.properties['ADMIN'] === country)
			L.geoJSON(this.geojson).addTo(this.map)
		})
	}


	findCityInText(){
		console.log('this.ids',this.ids);
		this.foundCities = []
		this.places = []
		this.foundCountries = []
		this.locations.map(location => {
			// Chercher une ville dans text
			let cityRegex = new RegExp("\\b"+location.city+"\\b")
			// Chercher un pays dans text
			let countryRegex = new RegExp("\\b"+location.country+"\\b")
			if (this.text.match(new RegExp(cityRegex,'g'))){
				this.foundCities.push(location)
			}	
			if (this.text.match(new RegExp(countryRegex,'g'))){
				if (!this.foundCountries.find(country => location.country === country))
					this.foundCountries.push(location.country)
			}	
		})

		console.log('this.foundCities ',this.foundCities);
		
		// Call the method geoJson to hilight country
		this.foundCountries.map(country => {
			this.geoJson('assets/data/countries.json',country)
		})

		if (this.map) this.map.remove()
		
		if (this.markers.length > 0){
			this.markers.map(marker => this.map.removeLayer(marker))
		}

		if (this.foundCities.length > 0){
			this.createMap(this.foundCities[0]['lat'], this.foundCities[0]['lng'],2)
			this.msg = ''
		}
		else {
			this.createMap(0, 0,2)
			this.msg = "aucune ville ou pays trouvés dans le text"
		}
	}

	// Cette méthode est pour lire un fichier text télécharger dans le navigateur
	fileUpload(e) {
		// remove markers when unselecting city
		if (this.markers.length > 0){
			this.markers.map(marker => this.map.removeLayer(marker))
		}

		// remove the line when unselecting city
		if (this.polyline)
			this.map.removeLayer(this.polyline)

		this.file = e.target.files[0];
		let fileReader = new FileReader();
		fileReader.onload = () => {
		  this.text = fileReader.result as string		  
		}
		fileReader.readAsText(this.file);
	}

	// Vider le textarea
	clearText(){
		this.text = ''
		
	}

	confirmCity(){
		console.log('this.ids',this.ids);
		
		// Get ids from location when choosing city and mapping ids array to find every city and push it in cities array
		this.cities = this.ids.map(i =>{
			console.log('iiiiiiiiiiiii',i);
			return (this.locations.find(location => location.id === parseInt(i)))	
		})

		// remove markers when unselecting city
		if (this.markers.length > 0){
			this.markers.map(marker => this.map.removeLayer(marker))
		}

		// remove the line when unselecting city
		if (this.polyline)
			this.map.removeLayer(this.polyline)

		// Ajouter les markers sur la carte
		const c = []
		this.cities.map(location => {
			this.marker = L.marker([location.lat, location.lng],{ icon: this.smallIcon })
			this.marker.addTo(this.map).bindPopup(`<center><h3>${location.city}</h3><h2>${location.country}</h2></center>`)
			this.markers.push(this.marker)	
			let x = location.lat
			let y = location.lng
			c.push([x,y])
		})

		// relier les markers avec une ligne
		this.polyline = L.polyline(c)
		this.polyline.addTo(this.map)
		
		// Empty input file
		this.myInputVariable.nativeElement.value = ''
		this.clearText()
		
	}


	places = []
	confirmLocation(event,id){
		console.log(id);
		
		console.log(event.target.checked);
		if (event.target.checked){
			let loc = this.locations.filter(location => {
				return location.id === parseInt(id)
			})
			this.places.push(loc[0])
		}
		if (!event.target.checked){
			console.log('unchecked');
			console.log(id);
			
			
			this.places = this.places.filter(location => location.id !== parseInt(id))
		}

		// remove markers when unselecting city
		if (this.markers.length > 0){
			this.markers.map(marker => this.map.removeLayer(marker))
		}

		// remove the line when unselecting city
		if (this.polyline)
			this.map.removeLayer(this.polyline)

		// Ajouter les markers sur la carte
		const c = []
		this.places.map(location => {
			this.marker = L.marker([location.lat, location.lng],{ icon: this.smallIcon })
			this.marker.addTo(this.map).bindPopup(`<center><h3>${location.city}</h3><h2>${location.country}</h2></center>`)
			this.markers.push(this.marker)	
			let x = location.lat
			let y = location.lng
			c.push([x,y])
		})

		// relier les markers avec une ligne
		this.polyline = L.polyline(c)
		this.polyline.addTo(this.map)
		
		// Empty input file
		this.myInputVariable.nativeElement.value = ''
		this.clearText()
		console.log(this.places);
		
	}

	
}
