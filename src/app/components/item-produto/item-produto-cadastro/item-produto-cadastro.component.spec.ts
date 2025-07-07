import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemProdutoCadastroComponent } from './item-produto-cadastro.component';

describe('ItemProdutoCadastroComponent', () => {
  let component: ItemProdutoCadastroComponent;
  let fixture: ComponentFixture<ItemProdutoCadastroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemProdutoCadastroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemProdutoCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
