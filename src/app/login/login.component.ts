import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import jwt_decode from "jwt-decode";
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  hide = true;
  user={
    email:"",
    password:""
  }
  token:string
  constructor(private dataService:DataService, private router:Router) { }

	ngOnInit(): void {
		
	}

 	login(){
		// console.log(new Date().toISOString().slice(0,10))
	    this.dataService.login(this.user).subscribe((res:any) => {
			console.log(res)
			this.token = res
			const decoded = jwt_decode(this.token)
			console.log(decoded['email']);
			localStorage.setItem('token',this.token)
			localStorage.setItem('email',decoded['email'])
			localStorage.setItem('role',decoded['role'])
			localStorage.setItem('last_connexion',decoded['last_connexion'])
			this.router.navigate(['home'])
		})
  	}


}
