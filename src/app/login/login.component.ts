import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import jwt_decode from "jwt-decode";
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


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
  constructor(private authService:AuthService, private router:Router) { }

	ngOnInit(): void {
		
	}

 	login(){
		this.authService.login(this.user)
  	}


}
