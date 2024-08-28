import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergePartComponent } from './merge-part.component';

describe('MergePartComponent', () => {
  let component: MergePartComponent;
  let fixture: ComponentFixture<MergePartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MergePartComponent]
    });
    fixture = TestBed.createComponent(MergePartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
