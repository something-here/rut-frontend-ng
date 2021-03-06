import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Base64 } from 'js-base64';
import { ItemService, RutService, Item, Rut, ItemListRes } from '../../core';
import { regUrl, regSpecial } from '../../shared';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent implements OnChanges {
  
  @Input() rutID: string;
  @Input() itemnum: number;
  @Input() uname: string;
  @Output() added = new EventEmitter<boolean>();
  items: Item[];  // items by search
  addForm: FormGroup;
  showLoading: boolean = false;

  constructor(
    private itemService: ItemService,
    private rutService: RutService,
    private formBuild: FormBuilder
  ) {}

  ngOnChanges() {
    this.addForm = this.formBuild.group(
      { 'item_id': [null, [Validators.required]],
        'content': [''],
      }
    );
    this.loadDoneItems();
  }

  loadDoneItems() {
    this.itemService.get_list('user', this.uname, 1, '3')  // 3-done
      .subscribe(res => this.items= res.items)
  }

  onSearch(key: string){
    if ( key.length < 6) return;  // check the keyword length
    this.showLoading = true;
    const per = regUrl.test(key) ? 'url' : 'uiid';
    const perid = per === 'url' ? 'perurl' : key.replace(regSpecial, '');
    // put url in  query param as kw, avoid route error
    const kw =  per === 'url' ? Base64.encode(key) : '';
    this.itemService.get_list(per, perid, 1, '3', kw)  // '3' now just a placeholder, todo: search in done item
      .subscribe(res => {
        this.items = res.items;
        this.showLoading = false;
      })
  }

  onAdd() {
    const c = this.addForm.value;
    const cdata = Object.assign(c, { 
      rut_id: this.rutID,
      item_order: this.itemnum + 1,
      uname: this.uname,
    });

    if (this.addForm.invalid ) {
      alert("Invalid Input");
      return
    }
    this.rutService.collect(this.rutID, cdata)
    .subscribe(
      res => {
        this.added.emit(true);
      },   // pass res up, to parent rut view
      //err => console.log(err)
    );
  }
}
