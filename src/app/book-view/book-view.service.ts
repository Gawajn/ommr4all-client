import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { throwError } from 'rxjs';
import { ServerUrls } from '../server-urls';
import {catchError, map} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import { PageResponse, BookCommunication, PageCommunication } from '../data-types/communication';

@Injectable({
  providedIn: 'root'
})
export class BookViewService {
  currentBook = new BookCommunication('');

  constructor(private http: Http) {
  }

  getPages(book) {
    this.currentBook = new BookCommunication(book);
    return this.http.get(ServerUrls.list_pages(book)).pipe(
      map((res: any) => {
          const pages = res.json().pages as PageResponse[];
          return pages.map(page => new PageCommunication(this.currentBook, page.label));
      }),
      catchError((err: any) => {
        console.error(err);
        return throwError(err.statusText || 'Server error');
      }));
  }

}