import { Component, OnInit } from '@angular/core';
import {LoginService} from "../../services/login.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {first} from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loading = false;
  submitted = false;
  returnUrl: string | undefined;

  public email: any;
  public recoverform: any;
  public password: any;
  public token: any;
  public isLoading = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private toaster: ToastrService,
              private userService: LoginService) {
    if (this.userService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.email = '';
    this.password = '';
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  login() {
    const loginState = this.validateLogin();
    if (loginState['status']) {
      this.submitted = true;
      this.loading = true;
      this.userService.login(this.email, this.password)
        .pipe(first())
        .subscribe(
          data => {
            this.router.navigate(['/invoices']);
          },
          error => {
            this.toaster.error(error);
            this.loading = false;
          });
    }
  }
  private validateLogin() {
    const state = {
      status: true,
      message: ''
    };

    if (this.email === '') {
      state['status'] = false;
      state['message'] = 'Please, Choose an email';
    }

    if (this.password === '') {
      state['status'] = false;
      state['message'] = 'Please, select a password';
    }
    return state;
  }
}
