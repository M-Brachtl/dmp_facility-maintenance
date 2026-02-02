import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ModeService {
    private modeSubject = new BehaviorSubject<'list' | 'add' | 'remove'>('list');
    mode$ = this.modeSubject.asObservable();
    setMode(mode: 'list' | 'add' | 'remove') {
        this.modeSubject.next(mode);
    }
    getMode() {
        return this.modeSubject.getValue();
    }

    private eel_on: boolean = false;
    eel_on$ = new BehaviorSubject<boolean>(this.eel_on).asObservable();
}