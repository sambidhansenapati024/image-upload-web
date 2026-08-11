import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  private collapsedSubject =
    new BehaviorSubject<boolean>(false);

  collapsed$ =
    this.collapsedSubject.asObservable();

  get collapsed(): boolean {

    return this.collapsedSubject.value;

  }

  toggle(): void {

    this.collapsedSubject.next(
      !this.collapsedSubject.value
    );

  }

}
