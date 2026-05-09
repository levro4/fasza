import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService, ConfirmRequest } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent implements OnInit {
  private service = inject(ConfirmDialogService);
  private cdr = inject(ChangeDetectorRef);

  current: ConfirmRequest | null = null;

  ngOnInit() {
    this.service.request$.subscribe(req => {
      this.current = req;
      this.cdr.detectChanges();
    });
  }

  confirm() {
    this.current?.resolve(true);
    this.current = null;
    this.cdr.detectChanges();
  }

  cancel() {
    this.current?.resolve(false);
    this.current = null;
    this.cdr.detectChanges();
  }
}
