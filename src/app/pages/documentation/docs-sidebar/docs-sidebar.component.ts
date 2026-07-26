import { Component, OnInit } from '@angular/core';
import { DocumentationService } from '../../../service/documentation.service';

@Component({
  selector: 'app-docs-sidebar',
  imports: [],
  templateUrl: './docs-sidebar.component.html',
  styleUrl: './docs-sidebar.component.css'
})
export class DocsSidebarComponent implements OnInit {

  topics = [

    { id: 'getting-started', label: 'Getting Started', icon: 'pi pi-home' },

    { id: 'dashboard', label: 'Dashboard', icon: 'pi pi-th-large' },

    { id: 'upload', label: 'File Upload', icon: 'pi pi-upload' },

    { id: 'gallery', label: 'Gallery', icon: 'pi pi-images' },

    { id: 'profile', label: 'Profile', icon: 'pi pi-user' },

    { id: 'settings', label: 'Settings', icon: 'pi pi-cog' },

    { id: 'security', label: 'Security', icon: 'pi pi-shield' },

    { id: 'help-center', label: 'Help Center', icon: 'pi pi-question-circle' }

  ];

  filteredTopics = [...this.topics];

  currentTopic = 'getting-started';

  constructor(
    private documentationService: DocumentationService
  ) { }

  ngOnInit(): void {

    this.documentationService.selectedTopic$
      .subscribe(topic => {

        this.currentTopic = topic;

      });

    this.documentationService.searchText$
      .subscribe(text => {

        const value = text.toLowerCase().trim();

        this.filteredTopics = this.topics.filter(topic =>
          topic.label.toLowerCase().includes(value)
        );

      });

  }

  selectTopic(topic: string): void {

    this.documentationService.setTopic(topic);

  }


}
