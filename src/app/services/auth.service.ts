import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	authState = new BehaviorSubject(false);
	constructor(private agfa:AngularFireAuth, private router:Router) { }

	login(user){
		return this.agfa.signInWithEmailAndPassword(user.email,user.password)
			.then(response => {
				this.router.navigate(['map'])
				this.authState.next(true)
			})
	}

	logout(){
		this.router.navigate(['login']);
		this.authState.next(false)
	}

	isAuthenticated() {
		return this.authState.value
	}
}
