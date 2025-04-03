import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full'
      },
      {
        path: '',
        loadChildren: () => import('./modules/home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'play',
        loadChildren: () => import('./modules/play-screen/play-screen.module').then((m) => m.PlayScreenModule),
      },
      {
        path: 'decks',
        loadChildren: () => import('./modules/decks/decks.module').then((m) => m.DecksModule),
      },
      {
        path: 'lobby',
        loadChildren: () => import('./modules/lobby/lobby.module').then((m) => m.LobbyModule),
      },
      {
        path: 'options',
        loadChildren: () => import('./modules/options/options.module').then((m) => m.OptionsModule),
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload'
    }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
