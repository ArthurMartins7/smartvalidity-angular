import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, Observable, throwError } from "rxjs";
import { AuthenticationService } from '../auth/services/auth.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;

    if(localStorage){
      const tokenUsuarioAutenticado = localStorage.getItem('tokenUsuarioAutenticado');

      if (tokenUsuarioAutenticado) {
        authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${tokenUsuarioAutenticado}` }
        });
      }
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          this.authenticationService.logout();
          this.router.navigate(['/']);
        }
        return throwError(error);
      })
    );
  }
}
