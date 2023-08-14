import { Component, OnInit } from '@angular/core';

declare var $: any; // JQuery

@Component({
  selector: 'app-register-modal',
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.scss']
})
export class RegisterModalComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
