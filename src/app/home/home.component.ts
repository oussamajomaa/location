import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import { DataService } from '../services/data.service';
import { environment } from 'src/environments/environment';

import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';

const provider = new OpenStreetMapProvider();
const searchControl = GeoSearchControl({
	provider: provider,
});


import { Router } from '@angular/router';

import Geocoder from 'leaflet-control-geocoder';


import { Options } from "@angular-slider/ngx-slider";


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
	value: number = 5;
	options: Options = {
		showTicksValues: true,
		stepsArray:[]
	};

	
	clusters: L.MarkerClusterGroup
	locations = []
	country = ''
	countries = []
	coords = []

	loading = false
	geojson: any
	foundCities = []
	notFoundCities = []
	duplicatedCities = []
	notDuplicatedCities = []
	allNotDuplicatedCities = []
	foundCountries = []
	msg: string
	polyline: any
	cities = []
	ids = []
	bounds: any
	wordList = []

	spacyList = []
	spacyText = ""
	mainLayer: any
	uploadFile: boolean
	textArea: boolean = true
	groupeByList: any
	listOfText = []
	listOfDate = []
	textSelected = ""
	dateSelected = ""
	allCities = []
	onCenter = false
	onCartographier = true
	constructor(
		private dataService: DataService,
		private http: HttpClient,
		private router: Router

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


		// const GeocoderControl = new Geocoder();
		// GeocoderControl.addTo(this.map);
		// GeocoderControl.on('markgeocode', function (e) {
		// 	console.log(e)
		// })
		// const geocoder = new Geocoder()
		// geocoder.addTo(this.map)
		this.map.addControl(searchControl);

	}





	onSelectTextArea(e) {
		if (e.target.checked === true) {
			this.textArea = true
			this.uploadFile = false
			this.onCartographier = true
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
		this.allNotDuplicatedCities = []
		this.places = []
		this.allCities = []
		this.listOfText = []
		this.markers = []
		this.text = ''
		this.msg = ""
		this.fileName = ""
		this.listOfDate = []
		this.listOfText = []
		// this.rangevalue = 0
		this.onCartographier = true
		if (this.map) this.map.remove()
		this.createMap()
	}

	sendToSpacy(event) {
		this.notDuplicatedCities = []
		this.foundCities = []
		this.msg = ""
		if (this.textArea) {
			if (this.text != "") {
				this.http.get(`${environment.url_py}/text`, { params: { text: this.text } }).subscribe((res: any) => {
					this.spacyList = res

					this.identifyCity(this.spacyList)
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
					console.log(res);
					
					// Récuperer les noms des fichiers traités
					this.spacyList = this.spacyList.map(item => {
						let splitUrl = item.fileName.split("/")
						item.fileName = splitUrl[splitUrl.length - 1]
						return item
					})

					// Regrouper les noms des fichiers dans la liste listOfText
					this.groupeByList = this.groupBy(this.spacyList, item => item.fileName)
					console.log("this.groupeByList is ", this.groupeByList)

					for (let key of this.groupeByList) {
						let item = {
							legend:key[0],
							value:key[1][0].fileDate,
						}
						this.listOfText.push(item)
						
					}
					
					console.log("listOfText    **** ++++ *** ", this.listOfText);

					// Regrouper les noms des fichiers dans la liste listOfText
					this.groupeByList = this.groupBy(this.spacyList, item => item.fileDate)
					console.log("this.groupeByList is ", this.groupeByList)

					for (let key of this.groupeByList) {
						let item = {
							value:key[0]
						}
						this.listOfDate.push(item)
					}
					this.listOfDate = this.listOfDate.sort((a,b) => {
							if (parseInt(a.value) > parseInt(b.value)) return 1
							if (parseInt(a.value) < parseInt(b.value)) return -1
							return 0
						})
					
					this.options.stepsArray = this.listOfDate
					console.log("listOfDate    **** ++++ *** ", this.options.stepsArray);

					this.identifyCity(this.spacyList)
				})
			}
		}
	}

	identifyCity(list: any = []) {
		const spacyLoc = list.map(entity => {
			return entity.city
		})

		// convertir la liste des lieux en une chaîne de caractères
		this.spacyText = spacyLoc.toString()
		if (this.spacyText != "") {
			// Itérer la liste des locations et chercher si une ville est existe dans la chaîne de caractères
			this.locations.map(location => {
				let cityRegex = new RegExp("\\b" + location.city + "\\b")
				if (this.spacyText.match(new RegExp(cityRegex, 'g'))) {
					this.foundCities.push(location)
				}
			})
		}
		// Récupérer les lieux non identifiés et les mettre dans une liste notFoundCities
		list.map(item => {
			if (!this.foundCities.find(location => location.city === item.city)) {
				this.notFoundCities.push(item)
			}
		})

		// ####################################################
		// récupérer les lieux dupliqués et les mettre dans la list repeatedCities
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

		// Recupérer les villes non dupliqueés et les mettre dans la liste notDuplicatedCities
		// et les villes dupliqueés dans la liste duplicatedCities
		this.foundCities.map(location => {
			if (!repeatedCities.find(city => city === location.city)) {
				this.notDuplicatedCities.push(location)
			}
			else this.duplicatedCities.push(location)
		})

		// ####################################################
		// Afficher les villes non dupliquées
		if (this.notDuplicatedCities.length > 0) {
			// this.clusters = L.markerClusterGroup({});
			this.places = this.notDuplicatedCities
			this.displayOnMap()
		}
		else this.msg = "Aucun lieu trouvé !!!"

		list.forEach(item => {
			this.notDuplicatedCities.forEach(location => {
				if (item.city === location.city) {
					item.lat = location.lat
					item.lng = location.lng
					item.country = location.country
					this.allNotDuplicatedCities.push(item)
				}
			})
		})
	}

	confirmLocation(event, id) {
		this.onCenter = false
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
			this.places = this.places.filter(location => location.id !== parseInt(id))
		}
	}

	displayOnMap() {
		console.log("on center = ",this.onCenter);
		// this.onCenter = true
		this.places.map(location => {
			// return location.occurence = this.wordList.filter(word => word === location.city).length
			return location.occurence = this.spacyList.filter(item => item.city.match("\\b" + location.city + "\\b")).length
		})

		this.markers = []
		if (this.clusters) this.clusters.clearLayers()
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
	onSelectText(text) {
		console.log("on center = ",this.onCenter);
		console.log("text selected ",this.textSelected);
		console.log("date  ",text);
		this.onCenter = true
		// this.dateSelected = date
		this.textSelected = text

		let arr = []
		this.allNotDuplicatedCities.filter(place => {
			if (place.fileName === this.textSelected) arr.push(place)
		})

		// Récupérer l'occurence de chaque lieu
		arr.map(location => {
			return location.occurence = this.spacyList.filter(item => item.city.match("\\b" + location.city + "\\b")).length
		})
		console.log(arr);

		this.clusters.clearLayers()
		this.getMarkers(arr)

	}

	onSelectDate(date) {
		console.log("text selected ",this.dateSelected);
		console.log("date  ",date);
		this.onCenter = false
		this.dateSelected = date
		// this.textSelected = text

		let arr = []
		this.allNotDuplicatedCities.filter(place => {
			if (place.fileDate === this.dateSelected) arr.push(place)
		})

		// Récupérer l'occurence de chaque lieu
		arr.map(location => {
			return location.occurence = this.spacyList.filter(item => item.city.match("\\b" + location.city + "\\b")).length
		})
		console.log(arr);

		this.clusters.clearLayers()
		this.getMarkers(arr)

	}

	onSelectALl(){
		let arr = this.allNotDuplicatedCities

		// Récupérer l'occurence de chaque lieu
		arr.map(location => {
			return location.occurence = this.spacyList.filter(item => item.city.match("\\b" + location.city + "\\b")).length
		})
		console.log(arr);

		this.clusters.clearLayers()
		this.getMarkers(arr)

	}

	// Cette methode est pour ajouter les markers sur la carte
	getMarkers(arr: any = []) {
		this.markers = []
		if (this.map) this.map.remove()
		this.createMap()
		this.clusters = L.markerClusterGroup({});
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
							iconSize: [iconSize, iconSize],
							iconAnchor: [6, 10],
							popupAnchor: [5, -10],
							html: "<h1>hello</h1>",
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
			this.bounds = L.featureGroup(this.markers);
			this.map.fitBounds(this.bounds.getBounds(), { padding: [0, 0] });
		}
	}
}



	// async findPlace(places: [{ word: "", label: "" }]) {
	// 	if (places.length > 0) {
	// 		places.map(place => {
	// 			provider.search({ query: place.word })
	// 				.then(res => {
	// 					console.log('res**  ', res)
	// 					res.map(r => this.places.push(r))
	// 					this.places.push(res)

	// 				})
	// 			// console.log('results  ',results);
	// 		})
	// 	}
	// }

	// async searchAddress() {
	// 	this.places = []
	// 	if (this.markers.length > 0) {
	// 		this.markers.map(marker => this.map.removeLayer(marker))
	// 		console.log('delete');

	// 	}
	// 	// this.markers = []

	// 	console.log(this.address)
	// 	// search
	// 	if (this.address) {
	// 		const results = await provider.search({ query: this.address });
	// 		console.log('results', results);

	// 		// results.map(location => {
	// 		// 	let place = {
	// 		// 		label: location.label,
	// 		// 		lat:location.x,
	// 		// 		lng:location.y,
	// 		// 	}
	// 		// 	this.places.push(place)
	// 		// 	this.marker = L.marker([location.y, location.x], { icon: this.smallIcon })
	// 		// 	this.marker.addTo(this.map).bindPopup(`<center><h3>${location.label}</h3>`)
	// 		// 	this.markers.push(this.marker)

	// 		// })


	// 		// if (this.markers.length > 0) {
	// 		// 	const group = L.featureGroup(this.markers);
	// 		// 	this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
	// 		// }

	// 	}
	// 	console.log('places **', this.places);
	// 	console.log('markers ', this.markers);
	// }


	// locations: any = []
	// sendText() {
	// 	this.http.get(`${environment.url_py}/text`, { params: { text: this.text } })
	// 		.subscribe((res: any) => {
	// 			this.locations = res

	// 			this.locations = res.filter(location => {
	// 				return location.label === 'LOC'

	// 			})
	// 			console.log(this.locations);
	// 			// this.findPlace(this.locations)	
	// 		})
	// }

	// sendFile() {
	// 	if (this.file) {
	// 		const formData = new FormData()
	// 		formData.append('file', this.file, this.file.name)
	// 		this.dataService.sendFile(formData).subscribe(res => console.log('sent success'))
	// 	}
	// }

	// // fileUpload(e) {
	// // 	this.file = e.target.files[0];
	// // 	let fileReader = new FileReader();
	// // 	fileReader.onload = () => {
	// // 		this.text = fileReader.result as string
	// // 	}
	// // 	fileReader.readAsText(this.file);
	// // }

	// // dataURItoBlob(base64: any) {
	// // 	let binary = atob(base64.split(',')[1]);
	// // 	let array = [];
	// // 	for (let i = 0; i < binary.length; i++) {
	// // 		array.push(binary.charCodeAt(i));
	// // 	}
	// // 	return new Blob([new Uint8Array(array)], { type: 'text' });
	// // }


	// onFileSelected(event) {
	// 	const file: File = event.target.files[0];
	// 	if (file) {
	// 		this.fileName = file.name;
	// 		const formData = new FormData();
	// 		formData.append("name", file.name);
	// 		formData.append("file", file, file.name);
	// 		this.http.post(`${environment.url_py}/file`, formData).subscribe((res: any) => {

	// 			console.log(res)
	// 		})
	// 	}
	// }

	// clearText() {
	// 	this.text = ""
	// }




