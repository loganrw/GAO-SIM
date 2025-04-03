import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CardResponse } from '../../models/card-response';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(public http: HttpClient) { }

  getCards(page: number): Observable<CardResponse> {
    let url = `https://api.gatcg.com/cards/search?page=${page}&page_size=50`
    return this.http.get<CardResponse>(url);
  }

  getCardImages(imageLink: string) {
    let url = `https://api.gatcg.com${imageLink}`
    return this.http.get(url, { responseType: 'blob' });
  }
}
