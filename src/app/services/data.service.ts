import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class DataService {

	routes:any = []
	constructor(private http:HttpClient) { 
	}

	getLocation(){
		return this.http.get('http://vps783302.ovh.net:5000/cities')
		// return this.http.get('http://localhost:5000/cities')
		// return this.http.get('https://hpynimf4j3.execute-api.us-east-1.amazonaws.com/step/get-location')
	}

	getCountries(){
		return this.http.get('http://vps783302.ovh.net:5000/countries')
	}
	


}
