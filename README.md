# Location

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.5.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


## ADD ToastrModule

npm install ngx-toastr
npm install @angular/animations --save

in app.module.ts:
import { ToastrModule } from 'ngx-toastr';

and in our imports array, enter:
ToastrModule.forRoot(),




In angular.json:
"styles": [
   "src/styles.css",
   "node_modules/ngx-toastr/toastr.css"
]

or in style.css
@import "../node_modules/ngx-toastr/toastr.css";


Finally, before we can use ngx-toastr in any component in our Angular application, we need to run:
import { ToastrService } from ‘ngx-toastr’;

It is time for us to inject ToastrService into the respective component.ts constructor by running:

