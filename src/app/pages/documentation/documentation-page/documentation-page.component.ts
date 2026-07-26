import { Component } from '@angular/core';
import { DocsSidebarComponent } from '../docs-sidebar/docs-sidebar.component';
import { DocsContentComponent } from '../docs-content/docs-content.component';
import { DocsSearchComponent } from '../docs-search/docs-search.component';
import { DocsTocComponent } from '../docs-toc/docs-toc.component';

@Component({
  selector: 'app-documentation-page',
  imports: [  DocsSidebarComponent,
  DocsContentComponent,
  DocsSearchComponent, DocsTocComponent],
  templateUrl: './documentation-page.component.html',
  styleUrl: './documentation-page.component.css'
})
export class DocumentationPageComponent {

}
