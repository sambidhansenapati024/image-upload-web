import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile } from '../../../../shared/modal/profile';
import { CurrentUserService } from '../../../../service/current-user.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ProgressBar } from "primeng/progressbar";

@Component({
  selector: 'app-account-card',
  imports: [AsyncPipe],
  templateUrl: './account-card.component.html',
  styleUrl: './account-card.component.css'
})
export class AccountCardComponent {

  protected readonly user$: Observable<Profile | null>;

constructor(private currentUserService: CurrentUserService) {

  this.user$ = this.currentUserService.currentUser$;

}

}
