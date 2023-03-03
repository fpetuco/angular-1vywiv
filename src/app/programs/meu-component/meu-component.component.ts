import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  PoCheckboxGroupOption,
  PoLookupColumn,
  PoLookupComponent,
  PoModalAction,
  PoModalComponent,
} from '@po-ui/ng-components';

import { OrderFilter } from './programs/models/order-filter-model';

@Component({
  selector: 'app-meu-component',
  templateUrl: './meu-component.component.html',
  styleUrls: ['./meu-component.component.css'],
})
export class MeuComponentComponent implements OnInit {
  @ViewChild('advancedFilterModal', { static: false })
  advancedFilterModal: PoModalComponent;

  @ViewChild('filterLookup', { static: false }) filterLookup: PoLookupComponent;

  @Output() applyFilter: EventEmitter<OrderFilter> = new EventEmitter();

  @Input() public set receiveFilter(appliedFilter: OrderFilter) {
    console.log('receiveFilter');
    this.filter = { ...appliedFilter };
  }

  public filter: OrderFilter;
  public literals: any;
  public optionsWaiting: PoCheckboxGroupOption[];
  public optionsExecuting: PoCheckboxGroupOption[];
  public columnsServers: PoLookupColumn[];
  public applyAction: PoModalAction;
  public closeAction: PoModalAction;
  public disabled: boolean;

  constructor() {
    this.filter = new OrderFilter();
    this.disabled = false;
    this.optionsWaiting = [
      {
        label: 'request-pending',
        value: 'request-pending',
      },
      {
        label: 'execution-limit',
        value: 'execution-limit',
      },
    ];

    this.optionsExecuting = [
      {
        label: 'starting-request',
        value: 'starting-request',
      },
      {
        label: 'executing',
        value: 'executing',
      },
    ];

    this.columnsServers = [
      { label: 'code', property: 'code' },
      { label: 'name', property: 'name' },
    ];

    this.applyAction = {
      action: () => this.apply(),
      label: 'apply',
    };

    this.closeAction = {
      action: () => this.close(),
      label: 'close',
    };
  }

  ngOnInit(): void {}

  public setValue(attribute, value): void {
    console.log('po-lookup (change): public setValue:', attribute);

    if (value === undefined) {
      delete this.filter[attribute];
    } else {
      this.filter = { ...this.filter, [attribute]: value.srcElement.value };
    }
    console.log(this.filter);
  }

  ngOnChanges(SimpleChange) {
    console.log('(ngOnChanges)da modal', SimpleChange);
  }

  public pChange(e) {
    console.log('po-lookup (p-change) event', e);
  }

  public open(): void {
    this.advancedFilterModal.open();
  }

  public close(): void {
    this.advancedFilterModal.close();
  }

  public apply(): void {
    console.log('apply:', this.filter);
    this.applyFilter.emit(this.filter);
    //this.close();
  }

  public closeModal() {
    this.advancedFilterModal.close();
  }
}
