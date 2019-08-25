import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {BookCommunication} from '../data-types/communication';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-administrative-view',
  templateUrl: './administrative-view.component.html',
  styleUrls: ['./administrative-view.component.scss']
})
export class AdministrativeViewComponent implements OnInit {
  readonly view = new BehaviorSubject<string>('');

  constructor(
    private route: ActivatedRoute,
  ) {
    this.route.paramMap.subscribe(
      (params: ParamMap) => {
        this.view.next(params.get('view'));
      });
  }

  ngOnInit() {
  }

}