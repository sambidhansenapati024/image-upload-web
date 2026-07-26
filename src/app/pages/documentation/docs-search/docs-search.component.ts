import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { DocumentationService } from '../../../service/documentation.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-docs-search',
  imports: [ InputTextModule,FormsModule],
  templateUrl: './docs-search.component.html',
  styleUrl: './docs-search.component.css'
})
export class DocsSearchComponent {
  search = '';

constructor(
    private documentationService: DocumentationService
) {}

onSearch(): void {

    this.documentationService.setSearch(this.search);

}
}
