import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentationService {

  constructor() { }

   
  private readonly topics = [
    'getting-started',
    'dashboard',
    'upload',
    'gallery',
    'profile',
    'settings',
    'security',
    'help-center'
  ];

  private selectedTopic =
    new BehaviorSubject<string>('getting-started');

  selectedTopic$ =
    this.selectedTopic.asObservable();

  setTopic(topic: string): void {

    this.selectedTopic.next(topic);

  }

  private searchText =
    new BehaviorSubject<string>('');

searchText$ =
    this.searchText.asObservable();

setSearch(text: string): void {

    this.searchText.next(text);

}

  getCurrentTopic(): string {

    return this.selectedTopic.value;

  }

  getPreviousTopic(): string | null {

    const index =
      this.topics.indexOf(this.selectedTopic.value);

    return index > 0
      ? this.topics[index - 1]
      : null;

  }

  getNextTopic(): string | null {

    const index =
      this.topics.indexOf(this.selectedTopic.value);

    return index < this.topics.length - 1
      ? this.topics[index + 1]
      : null;

  }
}
