import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DocumentationTopic } from '../../../shared/modal/DocumentationTopic';
import { DocumentationService } from '../../../service/documentation.service';
import { DOCUMENTATION_TOPICS } from '../../../data/documentation.data';

@Component({
  selector: 'app-docs-content',
  imports: [ButtonModule ],
  templateUrl: './docs-content.component.html',
  styleUrl: './docs-content.component.css'
})
export class DocsContentComponent implements OnInit {
topic!: DocumentationTopic;
previousTopic: string | null = null;

nextTopic: string | null = null;

constructor(
    private documentationService: DocumentationService
) {}

  ngOnInit(): void {

    this.documentationService.selectedTopic$
        .subscribe(id => {

            const topic = DOCUMENTATION_TOPICS.find(
                t => t.id === id
            );

            if(topic){

                this.topic = topic;

            }
             this.previousTopic =
        this.documentationService.getPreviousTopic();

    this.nextTopic =
        this.documentationService.getNextTopic();

        });

}

goPrevious(): void {

    if(this.previousTopic){

        this.documentationService.setTopic(
            this.previousTopic
        );

    }

}

goNext(): void {

    if(this.nextTopic){

        this.documentationService.setTopic(
            this.nextTopic
        );

    }

}

getSectionId(heading: string): string {

    return heading
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-');

}

}
