import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http'
import { AuthService } from './auth.service';
import { errorHandling } from '../globals';
import { Router } from '@angular/router';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ModalService } from '../modal-service/modal-service.service';
import { MyModalComponent } from '../my-modal.component';
@Injectable()
export class TokenInterceptorService implements HttpInterceptor {

  constructor(private injector: Injector, public Router: Router, private modalService: ModalService){}
  intercept(req, next) {
    let authService = this.injector.get(AuthService)
    let tokenizedReq = req.clone(
      {
        headers: req.headers.set('Authorization', 'Bearer ' + authService.getToken())
      }
    )
    return next.handle(tokenizedReq).pipe(
      tap(res => {
        if(res instanceof HttpResponse){
          if(res.body && res.body.Success || res.body.Message){
            this.modalService.open(MyModalComponent, {icon: 'fa-check text-success', message: res.body.Message });
          }
        }

      }),
      catchError(err => {
        if (err instanceof HttpErrorResponse) {

          if (err.status === 401 || err.status === 403) {
              localStorage.clear();
              this.Router.navigate(['/login']);
          }

          if(err.status === 400 || err.status === 409 || err.status === 500){
            this.modalService.open(MyModalComponent, {icon: 'fa-times text-danger', message: err.error.Message });
          }

          // return the error back to the caller
          return throwError(err);
        }
      }),
      finalize(() => {
        // any cleanup or final activities.
      })
    );


  }

  //

}
