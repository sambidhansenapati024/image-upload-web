import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Profile } from '../shared/modal/profile';
import { ProfileService } from './profile.service';


@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {

  private currentUserSubject =
    new BehaviorSubject<Profile | null>(null);

  currentUser$: Observable<Profile | null> =
    this.currentUserSubject.asObservable();

  constructor(
    private profileService: ProfileService
  ) { }

  loadCurrentUser(): void {

    this.profileService.getMyProfile().subscribe({

      next: (profile) => {

        this.currentUserSubject.next(profile);

      },

      error: (err) => {

        console.error(err);

      }

    });

  }

  refresh(): void {

    this.loadCurrentUser();

  }

}