import { Component, Inject} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reel-dialog',
  templateUrl: './reel-dialog.component.html',
  styleUrls: ['./reel-dialog.component.css']
})
export class ReelDialogComponent{
  constructor(public dialogRef: MatDialogRef<ReelDialogComponent>) { }

  text: string = "";
  ngOnInit() {
  }

  close() {
    this.dialogRef.close(this.text);
  }

  cancel() {
    this.dialogRef.close();
  }
}
