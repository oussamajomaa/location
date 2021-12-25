import { Component, OnInit } from '@angular/core';
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
  constructor(private authService:AuthService) { }

	ngOnInit(): void {
		
	}

 	login(){
		// this.authService.login(this.user)
  	}


}
