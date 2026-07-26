import { Component } from '@angular/core';
import { DocumentationService } from '../../../service/documentation.service';
import { DocumentationTopic } from '../../../shared/modal/DocumentationTopic';
import { DOCUMENTATION_TOPICS } from '../../../data/documentation.data';

@Component({
  selector: 'app-docs-toc',
  imports: [],
  templateUrl: './docs-toc.component.html',
  styleUrl: './docs-toc.component.css'
})
export class DocsTocComponent {
   topic?: DocumentationTopic;

  constructor(
    private documentationService: DocumentationService
  ) {}

  ngOnInit(): void {

    this.documentationService.selectedTopic$
      .subscribe(id => {

        this.topic = DOCUMENTATION_TOPICS.find(t => t.id === id);

      });

  }

  getSectionId(heading: string): string {

    return heading
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-');

}

scrollToSection(heading: string): void {

    const id = this.getSectionId(heading);

    const element = document.getElementById(id);

    if (element) {

        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

    }

}
}
