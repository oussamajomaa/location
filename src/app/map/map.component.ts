import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../services/data.service';
import { environment } from 'src/environments/environment';


@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

	// @ViewChild('myInput') myInputVariable: ElementRef;


	clusters: L.MarkerClusterGroup
	map: any
	locations = []
	country = ''
	countries = []
	coords = []
	marker: any
	markers = []
	loading = false
	geojson: any
	text: string
	foundCities = []
	foundCountries = []
	file: any;
	msg: string
	polyline: any
	cities = []
	ids = []
	bounds: any
	places = []
	wordList = []
	fileName = '';
	spacyList = []
	spacyText = ""
	mainLayer:any
	uploadFile: boolean
	textArea: boolean = true

	constructor(
		private dataService: DataService,
		private http: HttpClient,

	) { }

	ngAfterViewInit(): void {

		this.dataService.getLocation().subscribe((res: any) => {
			this.locations = res
		})
		this.dataService.getCountries()
			.subscribe((res: any) => {
				this.countries = res

				this.loading = true
			})
		this.createMap()
	}

	createMap(lat = 0, lng = 0, z = 2) {
		this.map = L.map('map').setView([lat, lng], z);

		this.mainLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			minZoom: 1,
			maxZoom: 20,
			attribution: 'OSM'
		});
		this.mainLayer.addTo(this.map);
		// https://www.youtube.com/watch?v=ax--7KkM_io	
	}




	// geoJson(url: string, country: string) {
	// 	this.http.get(url).subscribe((res: any) => {
	// 		this.geojson = res
	// 		this.geojson = this.geojson.features.filter(data => data.properties['ADMIN'] === country)
	// 		L.geoJSON(this.geojson).addTo(this.map)
	// 	})
	// }




	// 

	onSelectTextArea(e) {
		if (e.target.checked === true) {
			this.textArea = true
			this.uploadFile = false
		}
		this.clearText()

	}

	onSelectUploadFile(e) {
		this.clearText()
		if (e.target.checked === true) {
			this.textArea = false
			this.uploadFile = true
		}
	}



	// Vider le textarea
	clearText() {
		this.foundCities = []
		this.places = []
		this.text = ''
		this.msg = ""
		this.fileName = ""
		// supprimer les anciens markers
		if (this.markers.length > 0) {
			this.markers.map(marker => this.map.removeLayer(marker))
		}
		if (this.clusters)
			this.map.removeLayer(this.clusters)	
		
	}

	sendToSpacy(event) {
		// this.foundCities = []
		// this.places = []
		if (this.textArea) {
			if (this.text) {
				this.http.get(`${environment.url_py}/text`, { params: { text: this.text } }).subscribe((res: any) => {
					// Filter location only
					this.spacyList = res.filter(entity => {
						return entity.label === "LOC"
					})
					console.log(this.spacyList)
					// Get location name only
					this.spacyList = this.spacyList.map(entity => {
						return entity.word
					})
					console.log('this.spacyList ', this.spacyList)

					// convert list to string
					this.spacyText = this.spacyList.toString()
					console.log('this.spacyText ', this.spacyText);
					if (this.spacyText != "") {
						console.log('spacy text la toussawi farag');

						this.locations.map(location => {
							// Chercher une ville dans text
							let cityRegex = new RegExp("\\b" + location.city + "\\b")
							// Chercher un pays dans text
							let countryRegex = new RegExp("\\b" + location.country + "\\b")
							if (this.spacyText.match(new RegExp(cityRegex, 'g'))) {
								this.foundCities.push(location)
							}
							// if (this.spacyText.match(new RegExp(countryRegex, 'g'))) {
							// 	if (!this.foundCountries.find(country => location.country === country))
							// 		this.foundCountries.push(location.country)
							// }
						})
					}
					//Call the method geoJson to hilight country
					// this.foundCountries.map(country => {
					// 	this.geoJson('assets/data/countries.json', country)
					// })
					if (this.map) this.map.remove()

					if (this.markers.length > 0) {
						this.markers.map(marker => this.map.removeLayer(marker))
					}

					if (this.foundCities.length > 0) {
						this.createMap(0, 0, 2)
						this.clusters = L.markerClusterGroup({
						});
					}
					else {
						this.createMap(0, 0, 2)
						this.msg = "Aucun lieu trouvé !!!"
					}
				})
			}
		}

		if (this.uploadFile) {
			const file: File = event.target.files[0];
			console.log('file ', file)
			if (file) {
				this.fileName = file.name
				const formData = new FormData();
				formData.append("name", file.name);
				formData.append("file", file, file.name);

				// Send file to Spacy and get response
				this.http.post(`${environment.url_py}/file`, formData).subscribe((res: any) => {
					// Filter location only
					this.spacyList = res.filter(entity => {
						return entity.label === "LOC"
					})


					this.spacyList = this.spacyList.map(item => {
						let splitUrl = item.fileName.split("/")
						item.fileName = splitUrl[splitUrl.length-1]
						return item
					})

					console.log(this.spacyList)

					
					// Get location name only
					const spacyLoc = this.spacyList.map(entity => {
						return entity.word
					})
					console.log('this.spacyList ', this.spacyList)

					// convert list to string
					this.spacyText = spacyLoc.toString()
					console.log('this.spacyText ', this.spacyText);
					if (this.spacyText != "") {
						console.log('spacy text la toussawi farag');

						this.locations.map(location => {
							// Chercher une ville dans text
							let cityRegex = new RegExp("\\b" + location.city + "\\b")
							// Chercher un pays dans text
							let countryRegex = new RegExp("\\b" + location.country + "\\b")
							if (this.spacyText.match(new RegExp(cityRegex, 'g'))) {
								this.foundCities.push(location)
							}
							// if (this.spacyText.match(new RegExp(countryRegex, 'g'))) {
							// 	if (!this.foundCountries.find(country => location.country === country))
							// 		this.foundCountries.push(location.country)
							// }
						})
					}
					//Call the method geoJson to hilight country
					// this.foundCountries.map(country => {
					// 	this.geoJson('assets/data/countries.json', country)
					// })
					if (this.map) this.map.remove()

					if (this.markers.length > 0) {
						this.markers.map(marker => this.map.removeLayer(marker))
					}

					if (this.foundCities.length > 0) {
						this.createMap(0, 0, 2)
						this.clusters = L.markerClusterGroup({
						});
					}
					else {
						this.createMap(0, 0, 2)
						this.msg = "Aucun lieu trouvé !!!"
					}
				})
			}

		}
	}

	confirmLocation(event, id) {
		console.log('', id);
		console.log(event.target.checked);
		if (event.target.checked) {
			let loc = this.locations.filter(location => {
				return location.id === parseInt(id)
			})
			this.places.push(loc[0])
		}
		if (!event.target.checked) {
			console.log('unchecked');
			console.log(id);
			this.places = this.places.filter(location => location.id !== parseInt(id))
		}
	}

	displayOnMap() {
		this.places.map(location => {
			// return location.occurence = this.wordList.filter(word => word === location.city).length
			return location.occurence = this.spacyList.filter(item => item.word.match("\\b" + location.city + "\\b")).length
		})


		console.log(this.places);

		this.markers = []
		this.clusters.clearLayers()
		// this.map.removeLayer(this.clusters)
		let tempMarker
		this.places.map(location => {
			this.marker = L.marker([location.lat, location.lng],
				{
					icon: new L.Icon(
						{
							iconUrl: 'assets/icons/circle_blue.png',
							// iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png',
							iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
							iconSize: [20 + location.occurence, 20 + location.occurence],
							iconAnchor: [6, 10],
							popupAnchor: [5, -10],
						}
					)
				}
			)

			this.marker.bindPopup(`<center><h3>${location.city}</h3><h2>${location.country}</h2></center>`)
			this.markers.push(this.marker)
			// this.map.setView([location.lat, location.lng],5)
			this.clusters.addLayer(this.marker)
			this.map.addLayer(this.clusters)
		})
		// Contenir tous les markers sur la carte
		if (this.markers.length > 1) {
			console.log(this.places);
			this.bounds = L.featureGroup(this.markers);
			console.log(this.bounds);
			this.map.fitBounds(this.bounds.getBounds(), { padding: [0, 0] });
		}
		// if (this.markers.length === 1) {
		// 	let tempMarker  = L.marker([this.places[0].lat-0.01, this.places[0].lng-0.01],
		// 		{
		// 			icon: new L.Icon(
		// 				{
		// 					iconUrl: 'assets/icons/circle_blue.png',
		// 					// iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png',
		// 					iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
		// 					iconSize: [0.1, 0.1],
		// 					iconAnchor: [6, 10],
		// 					popupAnchor: [5, -10],
		// 				}
		// 			)
		// 		}
		// 	)
		// 	this.clusters.addLayer(tempMarker)
		// 	this.map.addLayer(this.clusters)
		// 	this.markers.push(tempMarker)
		// 	this.bounds = L.featureGroup(this.markers);
		// 	this.map.fitBounds(this.bounds.getBounds(), { padding: [50, 50] });
		// }


	}

}


















	// ##################################################################


// onUploadFile(event) {
	// 	this.foundCities = []
	// 	const file: File = event.target.files[0];
	// 	if (file) {
	// 		this.fileName = file.name;
	// 		const formData = new FormData();
	// 		formData.append("name", file.name);
	// 		formData.append("file", file, file.name);

	// 		// Send file to Spacy and get response
	// 		this.http.post(`${environment.url_py}/file`, formData).subscribe((res: any) => {
	// 			// Filter location only
	// 			this.spacyList = res.filter(entity => {
	// 				return entity.label === "LOC"
	// 			})
	// 			console.log(this.spacyList)
	// 			// Get location name only
	// 			this.spacyList = this.spacyList.map(entity => {
	// 				return entity.word
	// 			})
	// 			console.log(this.spacyList)

	// 			// convert list to string
	// 			this.spacyText = this.spacyList.toString()
	// 			console.log(this.spacyText);

	// 			if (this.spacyText != "") {
	// 				this.locations.map(location => {
	// 					// Chercher une ville dans text
	// 					let cityRegex = new RegExp("\\b" + location.city + "\\b")
	// 					// Chercher un pays dans text
	// 					let countryRegex = new RegExp("\\b" + location.country + "\\b")
	// 					if (this.spacyText.match(new RegExp(cityRegex, 'g'))) {
	// 						this.foundCities.push(location)
	// 					}
	// 					if (this.spacyText.match(new RegExp(countryRegex, 'g'))) {
	// 						if (!this.foundCountries.find(country => location.country === country))
	// 							this.foundCountries.push(location.country)
	// 					}
	// 				})
	// 			}
	// 			//Call the method geoJson to hilight country
	// 			this.foundCountries.map(country => {
	// 				this.geoJson('assets/data/countries.json', country)
	// 			})
	// 			if (this.map) this.map.remove()

	// 			if (this.markers.length > 0) {
	// 				this.markers.map(marker => this.map.removeLayer(marker))
	// 			}

	// 			if (this.foundCities.length > 0) {
	// 				this.createMap(0, 0, 2)
	// 				this.clusters = L.markerClusterGroup({
	// 				});
	// 			}
	// 			else {
	// 				this.createMap(0, 0, 2)
	// 				this.msg = "Aucun lieu trouvé !!!"
	// 			}
	// 		})
	// 	}
	// }



	// findCityInText() {
	// 	console.log('this.ids', this.ids);
	// 	this.foundCities = []
	// 	this.places = []
	// 	this.foundCountries = []
	// 	this.markers = []
	// 	// console.log(this.text);

	// 	if (this.text) {
	// 		this.wordList = this.text.split(' ')
	// 		console.log("wordList: ", this.wordList);

	// 		this.locations.map(location => {
	// 			// Chercher une ville dans text
	// 			let cityRegex = new RegExp("\\b" + location.city + "\\b")
	// 			// Chercher un pays dans text
	// 			let countryRegex = new RegExp("\\b" + location.country + "\\b")
	// 			if (this.text.match(new RegExp(cityRegex, 'g'))) {
	// 				this.foundCities.push(location)
	// 			}
	// 			// if (this.text.match(new RegExp(countryRegex, 'g'))) {
	// 			// 	if (!this.foundCountries.find(country => location.country === country))
	// 			// 		this.foundCountries.push(location.country)
	// 			// }
	// 		})
	// 	}

	// 	// console.log('this.foundCities ', this.foundCities);

	// 	// //Call the method geoJson to hilight country
	// 	// this.foundCountries.map(country => {
	// 	// 	this.geoJson('assets/data/countries.json', country)
	// 	// })

	// 	if (this.map) this.map.remove()

	// 	if (this.markers.length > 0) {
	// 		this.markers.map(marker => this.map.removeLayer(marker))
	// 	}

	// 	if (this.foundCities.length > 0) {
	// 		this.createMap(0, 0, 2)
	// 		// console.log('Paris ',this.foundCities);
	// 		// if (this.foundCities.length === 1)
	// 		// 	this.createMap(this.foundCities[0]['lat'], this.foundCities[0]['lng'],10)
	// 		// if (this.foundCities.length > 1)
	// 		// 	this.createMap(this.foundCities[0]['lat'], this.foundCities[0]['lng'],2)
	// 		// this.msg = ''

	// 		// // test cluster groupe
	// 		this.clusters = L.markerClusterGroup({
	// 		});
	// 	}
	// 	else {
	// 		this.createMap(0, 0, 2)
	// 		this.msg = "Aucun lieu trouvé !!!"
	// 	}
	// }


	// confirmCity() {


	// 	console.log('this.ids', this.ids);

	// 	// Get ids from location when choosing city and mapping ids array to find every city and push it in cities array
	// 	this.cities = this.ids.map(i => {
	// 		console.log('iiiiiiiiiiiii', i);
	// 		return (this.locations.find(location => location.id === parseInt(i)))
	// 	})

	// 	// remove markers when unselecting city
	// 	if (this.markers.length > 0) {
	// 		this.markers.map(marker => this.map.removeLayer(marker))
	// 	}

	// 	// remove the line when unselecting city
	// 	if (this.polyline)
	// 		this.map.removeLayer(this.polyline)

	// 	// Ajouter les markers sur la carte
	// 	const c = []
	// 	this.cities.map(location => {
	// 		this.marker = L.marker([location.lat, location.lng], { icon: this.smallIcon })
	// 		this.marker.addTo(this.map).bindPopup(`<center><h3>${location.city}</h3><h2>${location.country}</h2></center>`)
	// 		this.markers.push(this.marker)

	// 		let x = location.lat
	// 		let y = location.lng
	// 		c.push([x, y])
	// 	})

	// 	// relier les markers avec une ligne
	// 	this.polyline = L.polyline(c)
	// 	this.polyline.addTo(this.map)

	// 	// Empty input file
	// 	this.myInputVariable.nativeElement.value = ''
	// 	// this.clearText()

	// }


	// changeCountry() {
	// 	// supprimer l'ancienne carte
	// 	if (this.map) this.map.remove()

	// 	// supprimer les anciens markers
	// 	if (this.markers.length > 0) {
	// 		this.markers.map(marker => this.map.removeLayer(marker))
	// 	}

	// 	// filtrer les coordonnées selon un pays choisi
	// 	this.coords = this.locations.filter(res => res.country === this.country)

	// 	// créer la carte 
	// 	this.createMap(this.coords[0]['lat'], this.coords[0]['lng'], 4)
	// 	this.geoJson('assets/data/countries.json', this.country)

	// }


	// Cette méthode est pour lire un fichier text télécharger dans le navigateur
	// fileUpload(e) {
	// 	console.log(e.target.files[0].name);
	// 	const extension = (e.target.files[0].name).split('.').pop()
	// 	console.log(extension);
	// 	this.markers = []
	// 	// remove markers when unselecting city
	// 	if (this.markers.length > 0) {
	// 		this.markers.map(marker => this.map.removeLayer(marker))
	// 	}

	// 	if (extension === 'txt') {
	// 		this.file = e.target.files[0];
	// 		let fileReader = new FileReader();
	// 		fileReader.onload = () => {
	// 			this.text = fileReader.result as string
	// 		}
	// 		fileReader.readAsText(this.file);
	// 	}
	// 	// e.target.value=null

	// }


