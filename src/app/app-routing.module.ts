import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BasicComponent } from './basic/basic.component';
import { EventComponent } from './event/event.component';
import { RegionComponent } from './region/region.component';
import { UploadComponent } from './upload/upload.component';
import { MultiUploadComponent } from './multi-upload/multi-upload.component';
import { MergePartComponent } from './merge-part/merge-part.component';
import { UploadMergeComponent } from './upload-merge/upload-merge.component';
import { MergeMultipleFileComponent } from './merge-multiple-file/merge-multiple-file.component';
import { MergePartWithoutLibComponent } from './merge-part-without-lib/merge-part-without-lib.component';

const routes: Routes = [
  {path:'',redirectTo:'merge-part-without-lib',pathMatch:'full'},
  {path:'region',component:RegionComponent},
  {path:'basic',component:BasicComponent},
  {path:'event',component:EventComponent},
  {path:'upload',component:UploadComponent},
  {path:'multi-upload',component:MultiUploadComponent},
  {path: 'merge-part',component:MergePartComponent},
  {path: 'upload-merge',component:UploadMergeComponent},
  {path:'multi-file-merge',component:MergeMultipleFileComponent},
  {path:'merge-part-without-lib',component:MergePartWithoutLibComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
