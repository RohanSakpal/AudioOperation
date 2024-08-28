import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BasicComponent } from './basic/basic.component';
import { EventComponent } from './event/event.component';
import { RegionComponent } from './region/region.component';
import { UploadComponent } from './upload/upload.component';
import { MultiUploadComponent } from './multi-upload/multi-upload.component';
import { MergePartComponent } from './merge-part/merge-part.component';

const routes: Routes = [
  {path:'',redirectTo:'merge-part',pathMatch:'full'},
  {path:'region',component:RegionComponent},
  {path:'basic',component:BasicComponent},
  {path:'event',component:EventComponent},
  {path:'upload',component:UploadComponent},
  {path:'multi-upload',component:MultiUploadComponent},
  {path: 'merge-part',component:MergePartComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
