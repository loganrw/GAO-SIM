import { Component, Input } from '@angular/core';
import { RoutingService } from '../../services/routing/routing.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  @Input() headerLinks: string[] = [];
  @Input() colorTheme: string;

  constructor(private routerService: RoutingService) { }

  navigateToPage(page: string) {
    this.routerService.navigateToPage(page);
  }

  checkLinkValue(link: string) {
    return this.headerLinks.includes(link) ? true : false;
  }
}
