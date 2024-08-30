import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BasicComponent } from './basic/basic.component';
import { EventComponent } from './event/event.component';
import { FormsModule } from '@angular/forms';
import { RegionComponent } from './region/region.component';
import { UploadComponent } from './upload/upload.component';
import { MultiUploadComponent } from './multi-upload/multi-upload.component';
import { MergePartComponent } from './merge-part/merge-part.component';
import { UploadMergeComponent } from './upload-merge/upload-merge.component';
import { MergeMultipleFileComponent } from './merge-multiple-file/merge-multiple-file.component';
import { MergePartWithoutLibComponent } from './merge-part-without-lib/merge-part-without-lib.component';

@NgModule({
  declarations: [
    AppComponent,
    BasicComponent,
    EventComponent,
    RegionComponent,
    UploadComponent,
    MultiUploadComponent,
    MergePartComponent,
    UploadMergeComponent,
    MergeMultipleFileComponent,
    MergePartWithoutLibComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
