import { Component } from '@angular/core';
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { RouterModule } from "@angular/router";
import { SidebarComponent } from "../../feature/sidebar/sidebar.component";

@Component({
  selector: 'app-main-layout',
  imports: [NavbarComponent, RouterModule, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

}
