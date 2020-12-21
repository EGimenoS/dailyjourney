import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UserSession } from '../interfaces/user-session';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { authEndpoint } from 'config';
import { catchError, tap } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response';
import { UserCredentials } from '../interfaces/user-credentials';
import { MatDialog } from '@angular/material/dialog';
import { ErrorsService } from './errors.service';
import { UiService } from './ui.service';
import { TravelsService } from './travels.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<UserSession>;
  public currentUser: Observable<UserSession>;
  private headers = new HttpHeaders({
    'Content-type': 'application/json',
  });
  constructor(
    private http: HttpClient,
    public jwtHelper: JwtHelperService,
    private dialog: MatDialog,
    private errorsService: ErrorsService,
    private uiService: UiService,
    private travelsService: TravelsService,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<UserSession>(this.initializeUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  private initializeUser(): UserSession {
    return localStorage.getItem('currentUser')
      ? JSON.parse(localStorage.getItem('currentUser'))
      : null;
  }

  public isAuthenticated(): boolean {
    return this.currentUserSubject.value ? true : false;
  }

  public login(credentials: UserCredentials): Observable<HttpResponse<ApiResponse>> | null {
    const { email, password } = credentials;
    return this.http
      .post<ApiResponse>(
        `${authEndpoint}/sign_in`,
        { email, password },
        { headers: this.headers, observe: 'response' as const }
      )
      .pipe(
        tap((response) => {
          const token = response.headers.get('Access-Token');
          this.setUser(token);
          this.dialog.closeAll();
        }),
        tap(() => this.travelsService.setTravelsForCurrentUser()),
        tap(() => {
          this.uiService.openSnackBar({
            message: 'Bienvenido de nuevo! 😀',
            class: 'success',
          });
        }),
        catchError((error: HttpErrorResponse) => {
          this.errorsService.handleError(error, 'Login de usuario');
          return of(null);
        })
      );
  }

  public logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    // this.router.navigate(['/home']);
    this.uiService.openSnackBar({
      message: 'Hasta pronto! 👋',
      class: 'success',
    });
    this.router.navigateByUrl('/home');
  }

  public setUser(token): void {
    const userObject = this.buildUserFromToken(token);
    localStorage.setItem('currentUser', JSON.stringify(userObject));
    this.currentUserSubject.next(userObject);
  }

  private buildUserFromToken(token): UserSession {
    const decodedToken = this.jwtHelper.decodeToken(token);
    return {
      id: decodedToken.user_id,
      token,
      name: decodedToken.name,
      avatar: decodedToken.avatar,
    };
  }
}
