import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { RouterModule } from "@angular/router";
import { SidebarComponent } from "../../feature/sidebar/sidebar.component";
import { SidebarService } from '../../shared/services/sidebar.service';
import { SupportChatComponent } from "../../shared/support-chat/support-chat.component";

@Component({
  selector: 'app-main-layout',
  imports: [NavbarComponent, RouterModule, SidebarComponent, SupportChatComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit {
   collapsed: boolean = false;

  constructor(
    private sidebarService: SidebarService
) {}


ngOnInit(): void {

    this.sidebarService.collapsed$
        .subscribe(value => {

            this.collapsed = value;

        });

}

}
