import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  PoBreadcrumb,
  PoCheckboxGroupOption,
  PoModalAction,
  PoModalComponent,
  PoMultiselectOption,
  PoPageFilter,
  PoPageListComponent,
  PoTableColumn,
  PoDisclaimerGroup,
  PoDisclaimer,
} from '@po-ui/ng-components';

import { OrderFilter } from './order-filter';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild('poPageList', { static: true }) poPageList: PoPageListComponent;
  @ViewChild('heroModal', { static: false }) heroModal: PoModalComponent;

  disclaimerGroup: PoDisclaimerGroup;
  hiringProcesses: Array<object>;
  hiringProcessesColumns: Array<PoTableColumn>;
  hiringProcessesFiltered: Array<object>;
  jobDescription: Array<string> = [];
  jobDescriptionOptions: Array<PoMultiselectOption>;
  labelFilter: string = '';
  status: Array<string> = [];
  statusOptions: Array<PoCheckboxGroupOption>;
  appliedFilter: OrderFilter;
  fields: OrderFilter;
  disabled: boolean = false;

  hero: string = '';
  filters: OrderFilter = new OrderFilter();
  optionsWaiting: PoCheckboxGroupOption[];
  optionsExecuting: PoCheckboxGroupOption[];
  optionsExecuted: PoCheckboxGroupOption[];

  public applyAction: PoModalAction;

  public readonly breadcrumb: PoBreadcrumb = {
    items: [
      { label: 'Home', action: this.beforeRedirect.bind(this) },
      { label: 'Hiring processes' },
    ],
  };

  public advancedFilterPrimaryAction: PoModalAction = {
    action: () => {
      this.poPageList.clearInputSearch();
      //this.advancedFilterModal.close();
    },
    label: 'Aplicar filters',
  };

  public readonly filterSettings: PoPageFilter = {
    action: this.filterAction.bind(this),
    advancedAction: this.advancedFilterActionModal.bind(this),
    placeholder: 'Search',
  };

  private disclaimers = [];
  liberaLookup: boolean;

  constructor(private router: Router) {
    this.optionsWaiting = [
      { label: 'pending', value: '1' },
      { label: 'execution-limit', value: '2' },
    ];

    this.optionsExecuting = [
      { label: 'starting-request', value: '3' },
      { label: 'executing', value: '4' },
    ];

    this.optionsExecuted = [
      { label: 'request-error', value: '5' },
      { label: 'execution-error', value: '6' },
    ];

    this.applyAction = {
      action: () => this.apply(),
      label: 'apply',
    };
  }

  ngOnInit() {
    this.disclaimerGroup = {
      title: 'Filters',
      disclaimers: [],
      change: this.onChangeDisclaimer.bind(this),
      remove: this.onClearDisclaimer.bind(this),
    };

    this.hiringProcesses = this.getItems();
    this.hiringProcessesColumns = this.getColumns();
    this.jobDescriptionOptions = this.getJobs();
    this.statusOptions = this.getHireStatus();
    this.hiringProcessesFiltered = [...this.hiringProcesses];
    this.filters = new OrderFilter();
    this.appliedFilter = new OrderFilter();
    this.fields = new OrderFilter();
  }

  advancedFilterActionModal() {
    this.heroModal.open();
  }

  filter() {
    const filters = this.disclaimers.map((disclaimer) => disclaimer.value);
    filters.length
      ? this.hiringProcessesFilter(filters)
      : this.resetFilterHiringProcess();
  }

  hiringProcessesFilter(filters) {
    this.hiringProcessesFiltered = this.hiringProcesses.filter((item) =>
      Object.keys(item).some(
        (key) =>
          !(item[key] instanceof Object) &&
          this.includeFilter(item[key], filters)
      )
    );
  }

  includeFilter(item, filters) {
    return filters.some((filter) =>
      String(item).toLocaleLowerCase().includes(filter.toLocaleLowerCase())
    );
  }

  onClearDisclaimer(disclaimers) {
    if (disclaimers.removedDisclaimer.property === 'search') {
      this.poPageList.clearInputSearch();
    }
    this.disclaimers = [];

    this.filter();
  }

  resetFilterHiringProcess() {
    this.hiringProcessesFiltered = [...this.hiringProcesses];
    this.status = [];
    this.jobDescription = [];
  }

  private beforeRedirect(itemBreadcrumbLabel) {
    if (this.hiringProcesses.some((candidate) => candidate['$selected'])) {
    } else {
      this.router.navigate(['/']);
    }
  }

  private disclaimerToFilter(disclaimers: PoDisclaimer[]): OrderFilter {
    let filter: OrderFilter = new OrderFilter();

    filter.situationReason = [];

    disclaimers.forEach((disclaimer: PoDisclaimer) => {
      if (disclaimer.property === 'situationReason') {
        filter[disclaimer.property].push(disclaimer.value);
      } else {
        filter[disclaimer.property] = disclaimer.value;
      }
    });

    return filter;
  }

  private onChangeDisclaimer(disclaimers: PoDisclaimer[]): void {
    let filter: OrderFilter;
    filter = this.disclaimerToFilter(disclaimers);

    this.appliedFilter = filter;
    this.filter();
  }

  public filterAction(quickSearch: string): void {
    if (quickSearch && quickSearch.length > 0) {
      this.reloadDisclaimers('quick', quickSearch);
    } else {
      this.filter();
    }
  }

  public setValue(attribute, value): void {
    if (value.srcElement.value === undefined) {
      delete this.fields[attribute];
    } else {
      this.fields = { ...this.fields, [attribute]: value.srcElement.value };
    }
  }

  public setValueChange(attribute, value): void {
    if (value === undefined) {
      delete this.fields[attribute];
    } else {
      this.fields = { ...this.fields, [attribute]: value };
    }
  }

  public applyAdvancedFilter(filter: OrderFilter): void {
    this.reloadDisclaimers('advanced', filter);
  }

  private reloadDisclaimers(filterType: string, filter?: any): void {
    let disclaimers: PoDisclaimer[] = [];

    if (filterType === 'quick') {
      disclaimers.push({
        label: 'Execution request:',
        value: filter,
        property: 'numPedExec',
      });
    }

    if (filterType === 'advanced') {
      disclaimers = this.filterToDisclaimers(filter as OrderFilter);
    }

    this.disclaimerGroup.disclaimers = disclaimers;
  }

  public filterToDisclaimers(filter: OrderFilter): PoDisclaimer[] {
    let disclaimers: PoDisclaimer[] = new Array<PoDisclaimer>();

    if (filter.programCode) {
      disclaimers.push({
        label: `Program: ${filter.programCode}`,
        property: 'programCode',
        value: filter.programCode,
      });
    }

    if (filter.hero) {
      disclaimers.push({
        label: `Herói: ${filter.hero}`,
        property: 'hero',
        value: filter.hero,
      });
    }

    return disclaimers;
  }

  public apply(): void {
    /*this.appliedFilter = {
      ...this.appliedFilter,
      hero: this.fields.hero,
      programCode: this.fields.programCode,
    };*/

    this.applyAdvancedFilter(this.fields);
    //this.heroModal.close();
  }

  public log(e, m) {
    console.log(`Evento: ${e} componente: ${m}`);
  }

  public d() {
    console.log('p-change');
    this.disabled = false;
  }

  public openHeroModal(): void {
    this.heroModal.open();
  }

  public closeHeroModal(): void {
    this.heroModal.close();
  }

  public heyBlur() {
    alert('Hello');
  }

  getColumns(): Array<PoTableColumn> {
    return [
      {
        property: 'hireStatus',
        label: 'Status',
        type: 'subtitle',
        subtitles: [
          { value: 'hired', color: 'success', label: 'Hired', content: '1' },
          {
            value: 'progress',
            color: 'warning',
            label: 'Progress',
            content: '2',
          },
          {
            value: 'canceled',
            color: 'danger',
            label: 'Canceled',
            content: '3',
          },
        ],
      },
      { property: 'idCard', label: 'Identity card', type: 'string' },
      { property: 'name', label: 'Name' },
      { property: 'age', label: 'Age' },
      { property: 'city', label: 'City' },
      { property: 'jobDescription', label: 'Job description', type: 'string' },
    ];
  }

  getHireStatus() {
    return [
      { value: 'hired', label: 'Hired' },
      { value: 'progress', label: 'Progress' },
      { value: 'canceled', label: 'Canceled' },
    ];
  }

  getItems() {
    return [
      {
        hireStatus: 'hired',
        name: 'James Johnson',
        city: 'Ontario',
        age: 24,
        idCard: 'AB34lxi90',
        jobDescription: 'Systems Analyst',
      },
      {
        hireStatus: 'progress',
        name: 'Brian Brown',
        city: 'Buffalo',
        age: 23,
        idCard: 'HG56lds54',
        jobDescription: 'Trainee',
      },
      {
        hireStatus: 'canceled',
        name: 'Mary Davis',
        city: 'Albany',
        age: 31,
        idCard: 'DF23cfr65',
        jobDescription: 'Programmer',
      },
      {
        hireStatus: 'hired',
        name: 'Margaret Garcia',
        city: 'New York',
        age: 29,
        idCard: 'GF45fgh34',
        jobDescription: 'Web developer',
      },
    ];
  }

  getJobs() {
    return [
      { value: 'Systems Analyst', label: 'Systems Analyst' },
      { value: 'Trainee', label: 'Trainee' },
      { value: 'Programmer', label: 'Programmer' },
      { value: 'Web Developer', label: 'Web developer' },
      { value: 'Recruiter', label: 'Recruiter' },
      { value: 'Consultant', label: 'Consultant' },
      { value: 'DBA', label: 'DBA' },
    ];
  }
}
