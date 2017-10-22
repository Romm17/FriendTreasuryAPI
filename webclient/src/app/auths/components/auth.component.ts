import { LoadingComponent } from './../../shared/components/loading/loading.component';
import { UserService } from './../../shared/services/user.service';
import { Error } from './../../shared/models/error.model';
import { Credentials, CredentialsType } from './../../shared/models/credentials.model';
import { ListErrorsComponent } from './../../shared/components/list-errors/list-errors.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
    @ViewChild(ListErrorsComponent) listErrors: ListErrorsComponent;
    @ViewChild(LoadingComponent) loadingComponent: LoadingComponent;
    authType = CredentialsType.login;
    title: string;
    errors = new Array<Error>();
    authForm: FormGroup;
    constructor(private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private fb: FormBuilder) {
        this.authForm = this.fb.group({
            'username': ['', Validators.required],
            'password': ['', Validators.required]
        });
    }
    ngOnInit() {
        this.route.url.subscribe(data => {
            this.setCredentialsType(data[data.length - 1].path);
            this.updateTitle();
            if (this.isLogin()) {
                this.authForm.removeControl('phone');
                this.authForm.removeControl('confirm-password');
            } else {
                this.authForm.addControl('phone', new FormControl('', [Validators.required, Validators.maxLength(12)]));
                this.authForm.addControl('confirmPassword', new FormControl('', [Validators.required]));
            }
        });
        this.authForm.valueChanges.subscribe(p => this.onValueChange(p, this.authForm));
        this.loadingComponent.show();
    }
    submitForm() {
        this.loadingComponent.show();
        this.errors = new Array<Error>();
        const credentials = this.authForm.value;
        console.log(credentials);
        this.userService
            .attemptAuth(this.authType, credentials)
            .subscribe(
            data => this.router.navigateByUrl('/index'),
            err => {
                // console.log(err)
                this.errors = err;
                this.loadingComponent.hide();
            });
    }

    onValueChange(data: any, form: FormGroup) {
        console.log(data)
        this.errors = new Array<Error>();
        for (const key in form.controls) {
            if (form.controls.hasOwnProperty(key)) {
                const control = form.get(key);
                if (control && control.dirty && !control.valid) {
                    const message = ValidationMessages[key];
                    if (!!message) {
                        for (const error in control.errors) {
                            if (control.errors.hasOwnProperty(error)) {
                                this.errors.push(new Error(message[error], key));
                            }
                        }
                    }
                }
            }
        }
    }

    isLogin(): Boolean {
        return this.authType === CredentialsType.login;
    }

    private setCredentialsType(data: string): void {
        switch (data) {
            case 'login':
                this.authType = CredentialsType.login;
                break;
            case 'register':
                this.authType = CredentialsType.register;
                break;
            default:
                this.authType = CredentialsType.login;
                break;
        }
    }

    private updateTitle(): void {
        this.title = this.isLogin() ? 'Sign in' : 'Sign up';
    }
}

export const ValidationMessages = {
    username: {
        required: 'This field is requ'
    },
    password: {
        required: 'Обязательное поле.'
    },
    phone: {
        required: 'Обязательное поле.',
        maxlength: 'Обязательное поле.'
    }
};
