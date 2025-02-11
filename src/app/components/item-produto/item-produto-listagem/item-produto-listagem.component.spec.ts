import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemProdutoListagemComponent } from './item-produto-listagem.component';

describe('ItemProdutoListagemComponent', () => {
  let component: ItemProdutoListagemComponent;
  let fixture: ComponentFixture<ItemProdutoListagemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemProdutoListagemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemProdutoListagemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
