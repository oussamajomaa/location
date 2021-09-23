import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
	public locations = []
	constructor(private http:HttpClient) { 
	}

	getLocation(){
		return this.http.get('http://localhost:5000/cities')
		// return this.http.get('https://hpynimf4j3.execute-api.us-east-1.amazonaws.com/step/get-location')
	}

	getCountries(){
		return this.http.get('http://localhost:5000/countries')
	}
	getGeoJson(){
		// return this.http.get('http://localhost:5000/geojson')
		// return this.http.get('https://hpynimf4j3.execute-api.us-east-1.amazonaws.com/step/get-location')
	}



	login(user){
		return this.http.post(`${environment.url}/login`,user)
	}
	
	logout() {
		localStorage.removeItem('token');
		localStorage.removeItem('role');
		localStorage.removeItem('email');
		localStorage.removeItem('last_connexion');
	}


}
