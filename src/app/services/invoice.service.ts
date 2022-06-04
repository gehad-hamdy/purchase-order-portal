import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

   header:any;
  constructor(private http: HttpClient) {
    // @ts-ignore
    let user = JSON.parse(localStorage.getItem("currentUser"));
    this.header = new HttpHeaders()
      .set('Authorization',  `Bearer ${user['token']}`)
      .set('accept',  `application/json`)
  }

  public getInvoices() {
    const url = environment.API_BASE_URL + '/api/invoices';
    return this.http.get(url,  {
      responseType: "json",
      headers: this.header
    });
  }

  public getInvoicesSearch(filters: any) {
    const url = environment.API_BASE_URL + '/api/invoices/search';
    return this.http.get(url, {
      params: filters,
      headers: this.header
    });
  }

  public importInvoiceSheet(invoiceSheet: any) {
    const url = environment.API_BASE_URL + '/api/invoices/import';
    return this.http.post<any>(url, invoiceSheet, {
      reportProgress: true,
      observe: 'events',
      headers: this.header
    });
  }
}
