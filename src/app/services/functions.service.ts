import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as L from 'leaflet';



@Injectable({
	providedIn: 'root'
})
export class FunctionsService {

	constructor(private http:HttpClient) { }

	// Transform string into Camel Case
	toCamelCase(s) {
		return s.split(/(?=[A-Z])/).map(function (p) {
			return p.charAt(0).toUpperCase() + p.slice(1);
		}).join(' ');
	}

	// Sort list of Objects
	sortListObject(list:[]) {
		list.sort((a: any, b: any) => {
			if (a.city > b.city) return 1
			if (a.city < b.city) return -1
			return 0
		})
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


	// methode pour créer un fichier csv
	downloadFile(data: any, name: string) {
		const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
		const header = Object.keys(data[0]);
		const csv = data.map((row) =>
			header
				.map((fieldName) => JSON.stringify(row[fieldName], replacer))
				.join(',')
		);
		csv.unshift(header.join(','));
		const csvArray = csv.join('\r\n');

		const a = document.createElement('a');
		const blob = new Blob([csvArray], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);

		a.href = url;
		a.download = name;
		a.click();
		window.URL.revokeObjectURL(url);
		a.remove();
	}

	// Sauvegarder les ambigus et les lieus non reconnus dans deux fichier csv
	exportCSV(foundCities:any[],notFoundCities:any[]) {
		let found = []
		foundCities.map(location => found.push({ lieu: location.city, country: location.country, occurence:location.occurence }))
		
		// this.downloadFile(found, 'reconnu')
		let notFound = []
		notFoundCities.map(location => notFound.push({ lieu: location.city, country:"", occurence:"" }))
		let list = found.concat(notFound)
		this.downloadFile(list, 'file')
	}

	getOccurence(arr1:any[],arr2:any[]){
		arr1.map(location => {
			// return location.occurence = this.wordList.filter(word => word === location.city).length
			return location.occurence = arr2.filter(item => item.city.match("\\b" + location.city + "\\b")).length
		})
	}

	getCountryCoords(allCountries:any[],url:string, countryCordinate:any[],marker:any, markers:any[]){
		allCountries.forEach(item => {
			this.http.get(url).subscribe((res: any) => {
				let coords:any = []	
				let cc:any = []
				res.features.map((river:any) => {
					if (river.properties.admin === item.country) {
						coords.push(
							{
								name:item.country,
								coords:river.geometry.coordinates[0],
								fileDate:item.fileDate,
								fileName:item.fileName
							})
					}
				})
				cc.push(coords[0])
				console.log(cc);
				
				cc.map(location =>{
					if (Array.isArray(location.coords[0][0])){
						location.lat = location.coords[0][0][0]
						location.lng = location.coords[0][0][1]
						return location
					}
					else{
						location.lat = location.coords[0][0]
						location.lng = location.coords[0][1]
						return location
						
					}
				})
				countryCordinate.push(cc[0])
				countryCordinate.map(country => {
					marker = L.marker([country.lat, country.lng])
					markers.push(marker)
				})
			})
		})
		console.log(countryCordinate);
	}

	getRiverCoords(allRivers:any[],url:string,riverCordinate:any[],marker:any, markers:any[]){
		allRivers.forEach(item => {
			this.http.get(url).subscribe((res: any) => {
				let coords:any = []	
				res.features.map((river:any) => {
					if (river.properties.name === item.name) {
						coords.push(
							{
								name:item.name,
								coords:river.geometry.coordinates[0],
								fileDate:item.fileDate,
								fileName:item.fileName
							})
					}
				})
				coords = this.groupBy(coords,river => river.name)
				for (let key of coords) {					
					riverCordinate.push({name:key[1][0].name, lat:key[1][0].coords[0], lng:key[1][0].coords[1], fileDate:key[1][0].fileDate,fileName:key[1][0].fileName})
				}
				
				let rc:any = []
				rc = this.groupBy(riverCordinate, river => river.name)
				
				riverCordinate = []
				for (let key of rc){
					riverCordinate.push(key[1][0]);
				}
				riverCordinate.map(river => {
					marker = L.marker([river.lng, river.lat])
					markers.push(marker)
				})

			})
		})
	}

}
