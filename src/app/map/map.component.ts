import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../services/data.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

import { Options } from "@angular-slider/ngx-slider";
import { FunctionsService } from '../services/functions.service';


@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

	@ViewChild('myInput') myInput: ElementRef;

	value: number = 5;
	options: Options = {
		showTicksValues: true,
		stepsArray: []
	};

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
	notFoundCities: any = []
	duplicatedCities: any = []
	notDuplicatedCities: any = []
	allNotDuplicatedCities: any = []
	foundCountries: any = []
	arr: any = []
	file: any;
	msg: string
	polyline: any
	cities = []
	ids = []
	bounds: any
	places: any = []
	wordList = []
	fileName = '';
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
	noRepeatedCities: any = []
	notFoundRepeatedCities: any = []
	groupCountries = []
	onCenter = false
	onCartographier = true
	constructor(
		private dataService: DataService,
		private http: HttpClient,
		private router: Router,
		private fs: FunctionsService

	) { }

	ngAfterViewInit(): void {
		this.dataService.getLocation().subscribe((res: any) => {
			this.locations = res
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
		// this.map.addControl(searchControl);	
	}


	isClicked = true
	onSelectTextArea(e) {
		this.textArea = true
		this.onCartographier = true
		this.clearText()
	}

	onSelectUploadFile(e) {
		this.clearText()
		this.textArea = false
	}

	// Vider le textarea
	clearText() {
		this.groupCountries = []
		this.duplicatedCities = []
		this.multiDuplicatedCities = []
		this.notFoundCities = []
		this.foundCities = []
		this.notDuplicatedCities = []
		this.allNotDuplicatedCities = []
		this.foundCountries = []
		this.places = []
		this.allCities = []
		this.listOfText = []
		this.markers = []
		this.text = ''
		this.msg = ""
		this.fileName = ""
		this.listOfDate = []
		this.listOfText = []
		this.notFoundRepeatedCities = []
		this.noRepeatedCities = []
		this.geojson = []
		// this.rangevalue = 0
		this.onCartographier = true
		if (this.map) this.map.remove()
		this.createMap()
	}

	isTooLarge = false
	sendToSpacy(event) {
		this.notFoundRepeatedCities = []
		this.notDuplicatedCities = []
		this.foundCities = []
		this.noRepeatedCities = []
		this.duplicatedCities = []
		this.multiDuplicatedCities = []
		this.notFoundCities = []
		this.allNotDuplicatedCities = []
		this.markers = []
		this.foundCountries = []
		this.geojson = []
		this.groupCountries = []
		if (this.clusters) this.clusters.clearLayers()

		this.msg = ""
		if (this.textArea) {
			if (this.text) {
				this.onCartographier = false
				this.http.get(`${environment.url_py}/text`, { params: { text: this.text } }).subscribe((res: any) => {
					this.spacyList = res
					this.identifyCity(this.spacyList)
				})
			}
			// this.clearText()
		}

		if (!this.textArea) {
			this.clearText()
			this.loading = true
			const file: File = event.target.files[0];
			this.myInput.nativeElement.value = ""

			if (file) {
				if (file.size < 1000000) {
					this.fileName = file.name
					const formData = new FormData();
					formData.append("name", file.name);
					formData.append("file", file, file.name);
					this.sendFormData(formData)
				}
				else {
					// if (file.type === "application/zip" && file.size < 300000){
					// 	this.fileName = file.name
					// 	const formData = new FormData();
					// 	formData.append("name", file.name);
					// 	formData.append("file", file, file.name);
					// 	this.sendFormData(formData)
					// }
					// else{
					// this.isTooLarge = true
					this.myInput.nativeElement.value = ""
					alert('file too large')
					// }
				}
			}
		}
	}

	sendFormData(formData: any) {
		// Send file to Spacy and get response
		this.http.post(`${environment.url_py}/file`, formData).subscribe((res: any) => {
			this.spacyList = res
			// Regrouper les noms des fichiers dans la liste listOfText
			this.groupeByList = this.fs.groupBy(this.spacyList, item => item.fileName)

			for (let key of this.groupeByList) {
				let item = {
					legend: key[0],
					value: key[1][0].fileDate,
				}
				this.listOfText.push(item)

			}

			// Regrouper les dates des fichiers dans la liste listOfDate
			this.groupeByList = this.fs.groupBy(this.spacyList, item => item.fileDate)

			for (let key of this.groupeByList) {
				let item = {
					value: key[0]
				}
				this.listOfDate.push(item)
			}
			this.listOfDate = this.listOfDate.sort((a, b) => {
				if (parseInt(a.value) > parseInt(b.value)) return 1
				if (parseInt(a.value) < parseInt(b.value)) return -1
				return 0
			})
			this.options.stepsArray = this.listOfDate
			this.identifyCity(this.spacyList)
		})
	}

	multiDuplicatedCities: any = []
	identifyCity(list: any = []) {
		this.loading = false
		// create list of spacy location
		const spacyLocation = list.map(entity => {
			return entity.city
		})

		// convertir la liste des lieux en une chaîne de caractères
		this.spacyText = spacyLocation.toString()

		if (this.spacyText != "") {
			// Itérer la liste des locations et chercher si une ville est existe dans la chaîne de caractères
			this.locations.map(location => {
				let cityRegex = new RegExp("\\b" + location.city + "\\b")
				if (this.spacyText.match(new RegExp(cityRegex, 'g'))) {
					this.foundCities.push(location)
				}
				let countryRegex = new RegExp("\\b" + location.country + "\\b")
				if (this.spacyText.match(new RegExp(countryRegex, 'g'))) {
					this.foundCountries.push(location.country)
				}
			})
		}
		this.foundCountries = this.fs.groupBy(this.foundCountries,location => location)
		this.groupCountries = []
		for (let key of this.foundCountries) {
			this.groupCountries.push(key[0])
		}
		
		
		
		
		// Récupérer les lieux non identifiés et les mettre dans une liste notFoundCities
		list.map(item => {
			if (!this.foundCities.find(location => location.city === item.city)) {
				this.notFoundCities.push(item)
			}
		})

		if (this.notFoundCities.length > 1) {
			this.fs.sortListObject(this.notFoundCities)
		}


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


		if (this.duplicatedCities.length > 1) {
			this.fs.sortListObject(this.duplicatedCities)
		}


		if (this.duplicatedCities.length > 1) {
			let nrc = this.fs.groupBy(this.duplicatedCities, item => item.city)
			for (let key of nrc) {
				this.multiDuplicatedCities.push(key[1])
			}
		}


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

		if (this.allNotDuplicatedCities.length > 1) {
			this.fs.sortListObject(this.allNotDuplicatedCities)
		}


		let nrc = this.fs.groupBy(this.allNotDuplicatedCities, item => item.city)
		for (let key of nrc) {
			let item = {
				city: key[0],
				country: key[1][0].country
			}
			this.noRepeatedCities.push(item)
		}

		
		// add les pays à liste des lieux trouvés
		this.groupCountries.map(country => {
			let item = {
				city : country,
				country : country,
				occurence:1
			}
			this.noRepeatedCities.push(item)
		})


		this.fs.getOccurence(this.noRepeatedCities, this.spacyList)

		let nfc = this.fs.groupBy(this.notFoundCities, item => item.city)
		for (let key of nfc) {
			let item = {
				city: key[0],
			}
			this.notFoundRepeatedCities.push(item)
		}

		

		this.groupCountries.map(country => {
			this.notFoundRepeatedCities = this.notFoundRepeatedCities.filter(location => {
				location.country != country
			})
		})

		this.fs.sortListObject(this.notFoundRepeatedCities)


		// ####################################################
		// Afficher les villes non dupliquées
		if (this.notDuplicatedCities.length > 0) {
			this.places = this.allNotDuplicatedCities
			this.displayOnMap()
		}
		else {
			this.msg = "Aucun lieu trouvé !!!"
		}
	}

	confirmedLocation = []
	confirmLocation(event, id) {

		this.onCenter = false
		if (event.target.checked) {
			let loc = this.locations.filter(location => {
				return location.id === parseInt(id)
			})
			let item = loc[0]

			// Add fileDate and fileName to object item
			this.spacyList.forEach(element => {
				if (element.city === item.city) {
					item.fileDate = element.fileDate
					item.fileName = element.fileName
				}
			})

			this.allNotDuplicatedCities = this.allNotDuplicatedCities.filter(location => {
				return location.city != item.city
			})
			this.allNotDuplicatedCities.push(item)


			this.fs.sortListObject(this.allNotDuplicatedCities)

			this.confirmedLocation = this.confirmedLocation.filter(location => {
				return location.city != item.city
			})
			this.confirmedLocation.push(item)

			this.noRepeatedCities = []
			let nrc = this.fs.groupBy(this.allNotDuplicatedCities, item => item.city)
			for (let key of nrc) {
				let item = {
					city: key[0],
					country: key[1][0].country
				}
				this.noRepeatedCities.push(item)
				this.fs.sortListObject(this.noRepeatedCities)
				this.fs.getOccurence(this.noRepeatedCities, this.spacyList)
			}
		}
		// this.displayOnMap()

		// if (!event.target.checked) {
		// 	this.places = this.places.filter(location => location.id !== parseInt(id))
		// 	this.confirmedLocation = this.confirmedLocation.filter(location => location.id !== parseInt(id))
		// 	this.allNotDuplicatedCities = this.allNotDuplicatedCities.filter(location => location.id !== parseInt(id))
		// }

	}

	onFirsteCenter = true
	displayOnMap() {
		this.onFirsteCenter = true
		this.fs.getOccurence(this.allNotDuplicatedCities, this.spacyList)
		this.markers = []
		if (this.clusters) this.clusters.clearLayers()
		this.getMarkers(this.allNotDuplicatedCities)


		// remove location from confused list
		this.confirmedLocation.forEach((element) => {
			this.duplicatedCities = this.duplicatedCities.filter(location => {
				return location.city != element.city
			})
			// let index = this.duplicatedCities.indexOf(element)
			// this.duplicatedCities.splice(index, 1)
		})
		this.multiDuplicatedCities = []
		if (this.duplicatedCities.length > 1) {
			let nrc = this.fs.groupBy(this.duplicatedCities, item => item.city)
			for (let key of nrc) {
				this.multiDuplicatedCities.push(key[1])
			}
		}
		this.confirmedLocation = []
	}

	//  Cette methode pour recentrer la carte selon les markers en cliquant sur le bouton centrer
	onSelectText(text) {
		this.onFirsteCenter = true
		this.onCenter = true
		this.textSelected = text
		let arr = []
		this.allNotDuplicatedCities.filter(place => {
			if (place.fileName === this.textSelected) arr.push(place)
		})

		// Récupérer l'occurence de chaque lieu
		this.fs.getOccurence(arr, this.spacyList)
		if (this.clusters) this.clusters.clearLayers()
		this.getMarkers(arr)
	}

	onSelectDate(date) {
		this.onFirsteCenter = false
		this.onCenter = false
		this.dateSelected = date
		let arr = []
		this.allNotDuplicatedCities.filter(place => {
			if (place.fileDate === this.dateSelected) arr.push(place)
		})

		// Récupérer l'occurence de chaque lieu
		this.fs.getOccurence(arr, this.spacyList)
		if (this.clusters) this.clusters.clearLayers()
		this.getMarkers(arr)
	}

	onSelectALl() {
		let arr = this.allNotDuplicatedCities
		// this.onFirsteCenter=true
		// Récupérer l'occurence de chaque lieu
		this.fs.getOccurence(arr, this.spacyList)

		if (this.clusters) this.clusters.clearLayers()
		this.getMarkers(arr)
	}

	// Cette methode ajoute les markers sur la carte
	getMarkers(arr: any[]) {
		// this.fs.getMarkers(arr=arr,this.markers,this.map,this.clusters,L,this.onCenter,this.marker,this.bounds)
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
							// iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
							iconSize: [iconSize, iconSize],
							iconAnchor: [6, 10],
							popupAnchor: [5, -10],
							// html: "<h1>hello</h1>",
						}
					),
				}
			)

			this.marker.bindPopup(`<center><span>${location.city}</span><span> - </span><span>${location.country}</span></center><br><center><span>Occurrence: ${location.occurence}</span> - <span>${location.fileName} </span></center>`)
			this.markers.push(this.marker)
			// this.map.setView([location.lat, location.lng],5)
			this.clusters.addLayer(this.marker)
			this.map.addLayer(this.clusters)
		})
		// Contenir tous les markers sur la carte



		if (this.markers.length > 1) {
			if (this.markers[0]._latlng.lat != this.markers[this.markers.length - 1]._latlng.lat &&
				this.markers[0]._latlng.lng != this.markers[this.markers.length - 1]._latlng.lng) {
				this.bounds = L.featureGroup(this.markers);
				this.map.fitBounds(this.bounds.getBounds(), { padding: [0, 0] });
			}
		}

		// entourer les pays
		this.groupCountries.map(country => {
			this.geoJson('assets/data/countries.json',country)
		})
	}

	// Sauvegarder les ambigus et les lieus non reconnus dans deux fichier csv
	exportCSV() {
		this.fs.exportCSV(this.noRepeatedCities, this.notFoundRepeatedCities)
	}

	//dessiner les frontières
	geoJson(url: string, country: string) {
		this.http.get(url).subscribe((res: any) => {
			this.geojson = res
			this.geojson = this.geojson.features.filter(data => data.properties['ADMIN'] === country)
			L.geoJSON(this.geojson).addTo(this.map)
		})
	}
}
















