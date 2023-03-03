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

import { OrderFilter } from './order-filter';

@Component({
  selector: 'app-order-monitor-filter',
  templateUrl: './order-filter.component.html',
  styleUrls: ['./order-filter.component.css'],
})
export class OrderMonitorFilterComponent implements OnInit {
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

  ngOnChanges(SimpleChange) {
    this.log('ngOnChanges', 'order-filter.component');
    console.log('SimpleChange:', SimpleChange);
  }

  public setValue(attribute, value): void {
    console.log('(change): po-lookup:', attribute);

    if (value === undefined) {
      delete this.filter[attribute];
    } else {
      this.filter = { ...this.filter, [attribute]: value.srcElement.value };
    }

    console.log(this.filter);
  }

  public pChange(e) {
    console.log('(p-change) event po-lookup', e);
  }

  public log(e, m) {
    console.log(`Evento: ${e} componente: ${m}`);
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
