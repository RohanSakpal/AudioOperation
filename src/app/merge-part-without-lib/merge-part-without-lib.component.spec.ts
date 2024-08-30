import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergePartWithoutLibComponent } from './merge-part-without-lib.component';

describe('MergePartWithoutLibComponent', () => {
  let component: MergePartWithoutLibComponent;
  let fixture: ComponentFixture<MergePartWithoutLibComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MergePartWithoutLibComponent]
    });
    fixture = TestBed.createComponent(MergePartWithoutLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
