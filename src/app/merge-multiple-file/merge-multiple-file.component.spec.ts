import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeMultipleFileComponent } from './merge-multiple-file.component';

describe('MergeMultipleFileComponent', () => {
  let component: MergeMultipleFileComponent;
  let fixture: ComponentFixture<MergeMultipleFileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MergeMultipleFileComponent]
    });
    fixture = TestBed.createComponent(MergeMultipleFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
