import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../services/data.service';
import { environment } from 'src/environments/environment';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import { Router } from '@angular/router';
const provider = new OpenStreetMapProvider();
const searchControl = GeoSearchControl({
	provider: provider,
});

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
	notFoundCities = []
	duplicatedCities = []
	notDuplicatedCities = []
	allNotDuplicatedCities = []
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
	groupeByList:any
	listOfText= []
	textSelected=""
	allCities = []
	onCenter = false
	constructor(
		private dataService: DataService,
		private http: HttpClient,
		private router:Router

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
		this.map.addControl(searchControl);	
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
		this.duplicatedCities = []
		this.notFoundCities = []
		this.foundCities = []
		this.notDuplicatedCities = []
		this.places = []
		this.allCities = []
		this.listOfText = []
		this.text = ''
		this.msg = ""
		this.fileName = ""
		this.rangevalue = 0
		// supprimer les anciens markers
		if (this.markers.length > 0) {
			this.markers.map(marker => this.map.removeLayer(marker))
		}
		if (this.clusters)
			this.map.removeLayer(this.clusters)	
		
	}

	sendToSpacy(event) {
		if (this.textArea) {
			if (this.text != "") {
				this.http.get(`${environment.url_py}/text`, { params: { text: this.text } }).subscribe((res: any) => {
					this.spacyList = res
					console.log('response text ',res)
					// Get location name only
					const spacyLoc = this.spacyList.map(entity => {
						return entity.city
					})

					// convert list to string
					this.spacyText = spacyLoc.toString()
					console.log('this.spacyText ', this.spacyText);
					if (this.spacyText != "") {
						this.locations.map(location => {
							// Chercher une ville dans text
							let cityRegex = new RegExp("\\b" + location.city + "\\b")
							if (this.spacyText.match(new RegExp(cityRegex, 'g'))) {
								this.foundCities.push(location)
							}		
						})
					}

					this.spacyList.map(item => {
						if (!this.foundCities.find(location => location.city === item.city)) this.notFoundCities.push(item)
					})
					console.log("this.notFoundCities ",this.notFoundCities)

					// ####################################################
					// récupérer les lieux dupliqués
					let ids = {}
					let repeatedCities = []
					this.foundCities.forEach((val) => {
						if (ids[val.city]) {
							repeatedCities.push(val.city)
						} 
						else {
							ids[val.city] = true
						}
					})

					this.foundCities.map(location => {
						if (!repeatedCities.find(city => city === location.city )){
							this.notDuplicatedCities.push(location)
						}
						else this.duplicatedCities.push(location)
					})

					console.log('this.duplicatedCities ' ,this.duplicatedCities)
					console.log('this.not duplicatedCities ' ,this.notDuplicatedCities)

					// ####################################################

					if (this.notDuplicatedCities.length > 0) {

						this.clusters = L.markerClusterGroup({
						});
						this.places = this.notDuplicatedCities
						this.displayOnMap()
					}

					this.spacyList.forEach(item => {
						this.foundCities.forEach(location => {
							if (item.city === location.city) {
								item.lat = location.lat
								item.lng = location.lng
								item.country = location.country
								this.allCities.push(item)
							}
						})
					})

					this.spacyList.forEach(item => {
						this.notDuplicatedCities.forEach(location => {
							if (item.city === location.city) {
								item.lat = location.lat
								item.lng = location.lng
								item.country = location.country
								this.allNotDuplicatedCities.push(item)
							}
						})
					})

					
					// if (this.map) this.map.remove()

					// if (this.markers.length > 0) {
					// 	this.markers.map(marker => this.map.removeLayer(marker))
					// }

					// if (this.foundCities.length > 0) {
					// 	this.createMap(0, 0, 2)
					// 	this.clusters = L.markerClusterGroup({
					// 	});
					// }
					// else {
					// 	this.createMap(0, 0, 2)
					// 	this.msg = "Aucun lieu trouvé !!!"
					// }
				})
			}
		}

		if (this.uploadFile) {
			this.clearText()
			const file: File = event.target.files[0];
			// console.log('file ', file)
			if (file) {
				this.fileName = file.name
				const formData = new FormData();
				formData.append("name", file.name);
				formData.append("file", file, file.name);

				// Send file to Spacy and get response
				this.http.post(`${environment.url_py}/file`, formData).subscribe((res: any) => {
					this.spacyList = res
					console.log('this.spacyList is ',this.spacyList)
					this.spacyList = this.spacyList.map(item => {
						let splitUrl = item.fileName.split("/")
						item.fileName = splitUrl[splitUrl.length-1]
						return item
					})


					this.groupeByList = this.groupBy(this.spacyList,item => item.fileName)
					console.log("this.groupeByList is ",this.groupeByList)
					
					for (let key of this.groupeByList) {
						this.listOfText.push(key[0])
					}
					console.log("listOfText    **** ++++ *** ",this.listOfText);
					
					// Get location name only
					const spacyLoc = this.spacyList.map(entity => {
						return entity.city
					})

					// convert list to string
					this.foundCities = []
					this.spacyText = spacyLoc.toString()
					// console.log('this.spacyText ', this.spacyText);
					if (this.spacyText != "") {
						this.locations.map(location => {
							// Chercher une ville dans text
							let cityRegex = new RegExp("\\b" + location.city + "\\b")
							if (this.spacyText.match(new RegExp(cityRegex, 'g'))) {
								this.foundCities.push(location)
							}
						})
					}

					console.log("the found citiesis ", this.foundCities);
					// séparer les lieux trouvés de ceux non trouvés
					this.spacyList.map(item => {
						if (!this.foundCities.find(location => location.city === item.city)) this.notFoundCities.push(item)
					})
					console.log("this.notFoundCities ",this.notFoundCities)

					// ####################################################
					// récupérer les lieux dupliqués
					let ids = {}
					let repeatedCities = []
					this.foundCities.forEach((val) => {
						if (ids[val.city]) {
							repeatedCities.push(val.city)
						} 
						else {
							ids[val.city] = true
						}
					})

					this.foundCities.map(location => {
						if (!repeatedCities.find(city => city === location.city )){
							this.notDuplicatedCities.push(location)
						}
						else this.duplicatedCities.push(location)
					})

					console.log('this.duplicatedCities ' ,this.duplicatedCities)
					console.log('this.not duplicatedCities ' ,this.notDuplicatedCities)

					// ####################################################

					if (this.notDuplicatedCities.length > 0) {

						this.clusters = L.markerClusterGroup({
						});
						this.places = this.notDuplicatedCities
						this.displayOnMap()
					}

					this.spacyList.forEach(item => {
						this.foundCities.forEach(location => {
							if (item.city === location.city) {
								item.lat = location.lat
								item.lng = location.lng
								item.country = location.country
								this.allCities.push(item)
							}
						})
					})
					console.log('all cities with text', this.allCities);

					this.spacyList.forEach(item => {
						this.notDuplicatedCities.forEach(location => {
							if (item.city === location.city) {
								item.lat = location.lat
								item.lng = location.lng
								item.country = location.country
								this.allNotDuplicatedCities.push(item)
							}
						})
					})
					
					
					// if (this.map) this.map.remove()

					// if (this.markers.length > 0) {
					// 	this.markers.map(marker => this.map.removeLayer(marker))
					// }

					// if (this.foundCities.length > 0) {
					// 	this.createMap(0, 0, 2)
					// 	this.clusters = L.markerClusterGroup({
					// 	});
					// }
					// else {
					// 	this.createMap(0, 0, 2)
					// 	this.msg = "Aucun lieu trouvé !!!"
					// }
				})
			}

		}
	}

	confirmLocation(event, id) {
		this.onCenter = false
		// console.log('', id);
		// console.log(event.target.checked);
		if (event.target.checked) {
			let loc = this.locations.filter(location => {
				return location.id === parseInt(id)
			})
			console.log(loc[0]);
			console.log(this.places);
			
			this.places.push(loc[0])
			console.log(this.places);
		}
		if (!event.target.checked) {
			// console.log('unchecked');
			// console.log(id);
			this.places = this.places.filter(location => location.id !== parseInt(id))
		}
	}

	displayOnMap() {
		
		this.places.map(location => {
			// return location.occurence = this.wordList.filter(word => word === location.city).length
			return location.occurence = this.spacyList.filter(item => item.city.match("\\b" + location.city + "\\b")).length
		})


		console.log("this.places  ",this.places);

		this.markers = []
		this.clusters.clearLayers()
		// this.map.removeLayer(this.clusters)
	
		this.getMarkers(this.places)
		
	}


	// Cette methode va regrouper la liste selon le nom du fichier
	groupBy(list, keyGetter) {
		const map = new Map();
		list.forEach((item) => {
			 const key = keyGetter(item);
			 const collection = map.get(key);
			 if (!collection) {
				 map.set(key, [item]);
			 } else {
				 collection.push(item);
			 }
		});
		return map;
	}

	//  Cette methode pour recentrer la carte selon les markers en cliquant sur le bouton centrer
	onSelectText(text){
		// console.log('all cities ',this.allCities);
		// console.log("this.allNotDuplicatedCities ",this.allNotDuplicatedCities);
		
		this.onCenter = true
		this.textSelected = text
		// console.log('this.listOfText  ',this.listOfText);
		// console.log('value range', this.rangevalue);
		
		
		// console.log('selected text ',this.textSelected);
		
		console.log("all no duplicated citites", this.allNotDuplicatedCities);
		
		let arr = []
		// this.allCities.filter(place => {
		// 	if (place.fileName === this.textSelected) arr.push(place)
			
		// })
		this.allNotDuplicatedCities.filter(place => {
			if (place.fileName === this.textSelected) arr.push(place)
	
		})
		console.log(arr);

		arr.map(location => {
			// return location.occurence = this.wordList.filter(word => word === location.city).length
			return location.occurence = this.spacyList.filter(item => item.city.match("\\b" + location.city + "\\b")).length
		})


		console.log("this.places  ",arr);

		this.markers = []
		this.clusters.clearLayers()
		// this.map.removeLayer(this.clusters)
	
		this.getMarkers(arr)
		
	}

	// Cette methode est pour ajouter les markers sur la carte
	getMarkers(arr:any){
		let iconSize
		arr.map(location => {
			if (this.onCenter) iconSize = 20
			else iconSize = 20 + location.occurence
			this.marker = L.marker([location.lat, location.lng],
				{
					icon: new L.Icon(
						{
							iconUrl: 'assets/icons/circle_blue.png',
							// iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png',
							iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
							iconSize: [iconSize ,iconSize ],
							iconAnchor: [6, 10],
							popupAnchor: [5, -10],
							html:"<h1>hello</h1>",
						}
					),
					
				}
			)

			this.marker.bindPopup(`<center><span>${location.city}</span><span> - </span><span>${location.country}</span></center><br><center><span>- ${location.occurence} -</span></center>`)
			this.markers.push(this.marker)
			// this.map.setView([location.lat, location.lng],5)
			this.clusters.addLayer(this.marker)
			this.map.addLayer(this.clusters)
		})
		// Contenir tous les markers sur la carte
		if (this.markers.length > 1) {
			// console.log(this.places);
			this.bounds = L.featureGroup(this.markers);
			// console.log(this.bounds);
			this.map.fitBounds(this.bounds.getBounds(), { padding: [0, 0] });
		}
	}

	rangevalue = 0;
	onMoveSlider(value){
		// this.rangevalue = event.target.value;
		this.rangevalue = value
		console.log(value);
		this.onSelectText(this.listOfText[this.rangevalue-1])
		
	}

	navigateToLocation(){
		// console.log('Les lieux non reconnus ',this.notFoundCities)
		this.router.navigate(["location"],{queryParams:{notFoundCities:JSON.stringify(this.notFoundCities)}})
	}

}


















	// ##################################################################


// arr.map(location => {
		// 	this.marker = L.marker([location.lat, location.lng],
		// 		{
		// 			icon: new L.Icon(
		// 				{
		// 					iconUrl: 'assets/icons/circle_blue.png',
		// 					// iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png',
		// 					iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
		// 					iconSize: [20 , 20 ],
		// 					iconAnchor: [6, 10],
		// 					popupAnchor: [5, -10],
		// 				}
		// 			)
		// 		}
		// 	)

		// 	this.marker.bindPopup(`<center><span>${location.word}</span><span>--</span><span>${location.country}</span></center>`)
		// 	this.markers.push(this.marker)
		// 	// this.map.setView([location.lat, location.lng],5)
		// 	this.clusters.addLayer(this.marker)
		// 	this.map.addLayer(this.clusters)
		// })
		// // Contenir tous les markers sur la carte
		// if (this.markers.length > 1) {
		// 	console.log(this.places);
		// 	this.bounds = L.featureGroup(this.markers);
		// 	console.log(this.bounds);
		// 	this.map.fitBounds(this.bounds.getBounds(), { padding: [0, 0] });
		// }

// this.places.map(location => {
		// 	this.marker = L.marker([location.lat, location.lng],
		// 		{
		// 			icon: new L.Icon(
		// 				{
		// 					iconUrl: 'assets/icons/circle_blue.png',
		// 					// iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png',
		// 					iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
		// 					// iconSize: [20 + location.occurence, 20 + location.occurence],
		// 					iconSize: [20 , 20],
		// 					iconAnchor: [6, 10],
		// 					popupAnchor: [5, -10],
		// 				}
		// 			)
		// 		}
		// 	)

		// 	this.marker.bindPopup(`<center><span>${location.city}</span><span>--</span><span>${location.country}</span></center>`)
		// 	this.markers.push(this.marker)
		// 	// this.map.setView([location.lat, location.lng],5)
		// 	this.clusters.addLayer(this.marker)
		// 	this.map.addLayer(this.clusters)
		// })
		// // Contenir tous les markers sur la carte
		// if (this.markers.length > 1) {
		// 	console.log(this.places);
		// 	this.bounds = L.featureGroup(this.markers);
		// 	console.log(this.bounds);
		// 	this.map.fitBounds(this.bounds.getBounds(), { padding: [0, 0] });
		// }

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


