import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../../shared/services/sidebar.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLinkActive, RouterLink, NgClass],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  imageStudioExpanded = false;
   collapsed = false;

  constructor(
    private sidebarService: SidebarService
  ) {

    this.sidebarService.collapsed$
      .subscribe(value => {

        this.collapsed = value;

      });

  }

  toggleSidebar(): void {

    this.sidebarService.toggle();

  }

  toggleImageStudio(): void {

    this.imageStudioExpanded = !this.imageStudioExpanded;

}

}
