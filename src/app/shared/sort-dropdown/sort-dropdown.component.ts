import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'app-sort-dropdown',
    standalone: true,
    imports: [
        FormsModule,
        SelectModule
    ],
    templateUrl: './sort-dropdown.component.html',
    styleUrl: './sort-dropdown.component.css'
})
export class SortDropdownComponent {

    selected = 'newest';

    @Output()
    sortChange = new EventEmitter<string>();

    options = [
        { label: 'Newest First', value: 'newest' },
        { label: 'Oldest First', value: 'oldest' },
        { label: 'Name (A-Z)', value: 'nameAsc' },
        { label: 'Name (Z-A)', value: 'nameDesc' },
        { label: 'Size (Largest)', value: 'sizeDesc' },
        { label: 'Size (Smallest)', value: 'sizeAsc' }
    ];

}