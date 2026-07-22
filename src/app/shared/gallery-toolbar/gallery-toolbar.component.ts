import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-gallery-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    IconField,
    InputIcon,
    Select
  ],
  templateUrl: './gallery-toolbar.component.html',
  styleUrl: './gallery-toolbar.component.css'
})
export class GalleryToolbarComponent {

  @Input() title = '';

  @Input() subtitle = '';

  @Input() searchText = '';

  @Output() searchTextChange = new EventEmitter<string>();

  @Input() showSort = true;

  @Input() sortOptions: any[] = [];

  @Input() selectedSort: any;

  @Output() selectedSortChange = new EventEmitter<any>();

  onSearch() {

    this.searchTextChange.emit(this.searchText);

  }

  onSortChange() {

    this.selectedSortChange.emit(this.selectedSort);

  }

}