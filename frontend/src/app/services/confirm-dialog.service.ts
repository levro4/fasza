import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmRequest {
  message: string;
  confirmLabel: string;
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private requestSubject = new Subject<ConfirmRequest | null>();
  request$ = this.requestSubject.asObservable();

  confirm(message: string, confirmLabel = 'Confirm'): Promise<boolean> {
    return new Promise(resolve => {
      this.requestSubject.next({ message, confirmLabel, resolve });
    });
  }

  close() {
    this.requestSubject.next(null);
  }
}
