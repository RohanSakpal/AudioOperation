import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadMergeComponent } from './upload-merge.component';

describe('UploadMergeComponent', () => {
  let component: UploadMergeComponent;
  let fixture: ComponentFixture<UploadMergeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UploadMergeComponent]
    });
    fixture = TestBed.createComponent(UploadMergeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
