import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ItemService, AuthService } from '../../core';
import { itemCates } from '../../shared';

@Component({
  selector: 'app-new-item',
  templateUrl: './new-item.component.html',
  styleUrls: ['./new-item.component.css']
})
export class NewItemComponent implements OnInit {

  submitForm: FormGroup;
  canSubmit: Boolean;

  cates: string[];

  constructor(
    private router: Router,
    private itemService: ItemService,
    private authService: AuthService,
    private formBuild: FormBuilder
  ) {}

  ngOnInit() {
    this.authService.checkAuth();
    this.authService.isAuthed$.subscribe(auth => this.canSubmit = auth);
    if (!this.canSubmit) {
      alert("No Permission");
      return;
    }

    this.cates = itemCates;

    this.submitForm = this.formBuild.group(
      { 'title': [null, [Validators.required]],
        'uiid': [''],
        'authors': [null, [Validators.required]],
        'pub_at': [''],
        'publisher': [''],
        'category': ['Book'],
        'url': [''],
        'cover': [''],
        'edition': [''],
        'detail': [''],
      }
    );
  }

  onSubmit() {
    const item = this.submitForm.value;
    const either_url_uiid = Boolean(item.url.trim()) || Boolean(item.uiid.trim());

    if (this.submitForm.invalid || !either_url_uiid || !this.canSubmit ) {
      alert("Invalid Input");
      return
    }
    this.itemService.submit(item)
    .subscribe(
      res => this.router.navigateByUrl('/item/' + res.item.slug || res.item.id), // for backward compatible
      err => console.log(err)
    );
  }

}
