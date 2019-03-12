import {Component, ComponentRef, Inject, OnDestroy, OnInit} from '@angular/core';
import {TaskWorker} from '../../task';
import {Subject, Subscription} from 'rxjs';
import {ActionType} from '../../actions/action-types';
import {HttpClient} from '@angular/common/http';
import {ActionsService} from '../../actions/actions.service';
import {PageState} from '../../editor.service';
import {BlockType} from '../../../data-types/page/definitions';
import {PageLine} from '../../../data-types/page/pageLine';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {MessageSubstitutionLine} from 'tslint/lib/verify/lines';

export interface DetectStaffLinesDialogData {
  pageState: PageState;
  onClosed: any;
}

@Component({
  selector: 'app-detect-stafflines-dialog',
  templateUrl: './detect-stafflines-dialog.component.html',
  styleUrls: ['./detect-stafflines-dialog.component.css']
})
export class DetectStaffLinesDialogComponent implements OnInit, OnDestroy {
  private readonly _subscriptions = new Subscription();
  task: TaskWorker;

  constructor(
    private http: HttpClient,
    private actions: ActionsService,
    private dialogRef: MatDialogRef<DetectStaffLinesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetectStaffLinesDialogData,
  ) {
    this.task = new TaskWorker('staffs', this.http, this.data.pageState);
  }

  ngOnInit() {
    this._subscriptions.add(this.task.taskFinished.subscribe(res => this.onTaskFinished(res)));
    this.task.putTask();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
    this.cancel();
  }

  cancel() {
    this.task.cancelTask().then(() => this.close());
  }

  private close() {
    if (this.data.onClosed) { this.data.onClosed(); }
    this.dialogRef.close();
  }

  private onTaskFinished(res: {staffs: any}) {
    if (!res.staffs) {
      console.error('No staff transmitted');
    } else {
      this.actions.startAction(ActionType.StaffLinesAutomatic);
      res.staffs.forEach(json => {
        const mr = this.actions.addNewBlock(this.data.pageState.pcgts.page, BlockType.Music);
        const staff = PageLine.fromJson(json, mr);
        staff.detachFromParent();
        this.actions.attachLine(mr, staff);
      });
      this.actions.finishAction();
    }

    this.close();
  }
}
