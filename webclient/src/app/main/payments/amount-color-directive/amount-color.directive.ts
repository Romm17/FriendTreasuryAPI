import { Directive, Input, ElementRef, OnInit } from '@angular/core';

@Directive({ selector: '[amountColor]' })
export class AmountColorDirective implements OnInit {
  private minPrice = 0;
  private maxPrice = 300;

  @Input('amountColor') amountColor: number;

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    let coeff = (this.amountColor - this.minPrice) / (this.maxPrice - this.minPrice);
    coeff = coeff > 1. ? 1. : coeff;
    coeff = coeff < 0. ? 0. : coeff;
    const color = `rgb(${Math.round(Math.sin(coeff * Math.PI / 2) * 255)},${Math.round(Math.cos(coeff * Math.PI / 2) * 255)},0)`;
    (<HTMLElement>this.el.nativeElement).style.color = color;
  }
}
