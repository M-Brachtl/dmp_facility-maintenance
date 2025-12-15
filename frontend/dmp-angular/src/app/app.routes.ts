import { Routes } from '@angular/router';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { MachinesComponent } from './machines/machines.component';
import { RevisionsComponent } from './revisions/revisions.component';
import { RevTypesComponent } from './rev-types/rev-types.component';
import { TrainingsComponent } from './trainings/trainings.component';

export const routes: Routes = [
    {
        path: '',
        component: MainMenuComponent
    },
    {
        path: 'machines',
        component: MachinesComponent
    },
    {
        path: 'revisions',
        component: RevisionsComponent
    },
    {
        path: 'rev-types',
        component: RevTypesComponent
    },
    {
        path: 'trainings',
        component: TrainingsComponent
    }
];
