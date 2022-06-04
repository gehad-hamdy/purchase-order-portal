import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {User} from "../../../models/user";
import {InvoiceService} from "../../services/invoice.service";
import {ToastrService} from "ngx-toastr";
import {LoginService} from "../../services/login.service";
import {ActivatedRoute} from "@angular/router";
import {HttpEvent, HttpEventType} from "@angular/common/http";
import {map} from "rxjs";
import {Invoice} from "../../../models/invoice";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css']
})
export class InvoicesComponent implements OnInit, AfterViewInit {
  private file: any;
  invoices:  MatTableDataSource<Invoice> = new MatTableDataSource();
  currentUser: User;
  // @ts-ignore
  filters: { invoice_number: string; supplier_name: string; financial_account: string; page: number; };

  isLoading = false;
  totalRows = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  fileName = "";

  private supportedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  displayedColumns: string[] = ['invoice_number', 'supplier_name', 'currency', 'amount'];

  constructor(private invoiceService: InvoiceService,
              private toaster: ToastrService,
              private userService: LoginService,
              private route: ActivatedRoute) {
    this.currentUser = this.userService.currentUserValue;
  }

  ngOnInit(): void {
    this.filters = {
      'invoice_number': '',
      'supplier_name': '',
      'financial_account': '',
      'page' : 1
    };
    this.reset();
    this.getInvoices();
  }

  public reset() {
    this.file = '';
  }

  public fileChanged(event: any) {
    this.file = event.target.files[0];
    this.fileName = this.file.name;
  }

  private validateSheet() {
    if (!this.file || this.file === "") {
      return {status: false, message: "Choose a file!"};
    }
    // @ts-ignore
    if (this.supportedTypes.indexOf(this.file.type) === -1){
      return {status: false, message: "Choose an excel file"};
    }

    return {status: true, message: ""};
  }
  private apiResponse(response: any ) {
    if (response.status === 200 || response.status === 201) {
      if (response.body.errors) {
        window.alert(response.body.errors);
      }
      this.toaster.success(response["body"]["message"]);
    } else {
      this.toaster.error(
        response.error.message ? response.error.message : response.message
      );
    }
  }

  private apiResponseError(response: any) {
    if (response.status !== 400 && response.status !== 200) {
      this.toaster.error(response.statusText);
    }
  }

  private getEventMessage(event: HttpEvent<any>) {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        return this.apiResponseError({response: event});
      case HttpEventType.Response:
        return this.apiResponse(event);
    }
  }

   uploadInvoiceSheet(event: any) {
    this.fileChanged(event);
    const validation = this.validateSheet();
    if (validation["status"]) {
      const uploadData = new FormData();
      uploadData.append("sheet", this.file);
      this.invoiceService
        .importInvoiceSheet(uploadData)
        .pipe(map((event) => this.getEventMessage(event)))
        .subscribe(
          () => {
            this.toaster.success('uploaded Successful')
            this.getInvoices();
          },
          (err) => {
            this.toaster.error(
              err.error.message ? err.error.message : err.message
            );
          }
        );
    } else {
      this.toaster.error(validation["message"]);
    }
  }

  public getInvoices() {
    this.invoiceService.getInvoices().subscribe(
      (res) => {
        // @ts-ignore
        this.invoices.data = res['data'];
        setTimeout(() => {
          this.paginator.pageIndex = this.currentPage;
          // @ts-ignore
          this.paginator.length = res.total;
          // @ts-ignore
          this.totalRows = res.total;
        });
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.toaster.error('Can not fetch data');
      }
    );
  }

  public getInvoiceSearch() {
    this.invoiceService.getInvoicesSearch(this.filters).subscribe(
      (res) => {
        // @ts-ignore
        this.invoices = res['data'];
        setTimeout(() => {
          this.paginator.pageIndex = this.currentPage;
          // @ts-ignore
          this.paginator.length = res.total;
          // @ts-ignore
          this.totalRows = res.total;
        });
        this.isLoading = false;
      },
      (error) => {
        this.toaster.error('Can not fetch data');
        this.isLoading = false;
      }
    );
  }

  // @ts-ignore
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngAfterViewInit(): void {
    // @ts-ignore
    this.invoices.paginator = this.paginator;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    if (this.filters) {
      this.filters.page = this.currentPage;
      this.getInvoiceSearch();
    }
    else this.getInvoices();
  }

  applyFilter(){
    if (this.filters) {
      this.filters.page = this.currentPage;
      this.getInvoiceSearch();
    }
  }
}
