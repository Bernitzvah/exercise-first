import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ProjectModel, RatingModel } from 'src/app/models';
import { MatSort, Sort } from '@angular/material/sort';
import { ProjectQuery, RatingQuery } from 'src/app/queries';
import { Subscription } from 'rxjs';
import { ProjectStore, RatingStore } from 'src/app/stores';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.less']
})

export class TableComponent implements OnInit, OnDestroy {

  @ViewChild(MatSort) sort!: MatSort;

  @Input()
  public dataSource: ProjectModel[];

  @Input()
  public rating: RatingModel[];

  @Input()
  public canRate: boolean;

  displayedColumns: string[] = ['icon', 'name', 'description', 'date', 'stars'];

  private direction: boolean;

  private projectSubscription: Subscription | undefined;

  constructor(
    private projectQuery: ProjectQuery,
    private projectStore: ProjectStore,
    private ratingStore: RatingStore,
    private ratingQuery: RatingQuery,
    private cd: ChangeDetectorRef
  ) {
    this.direction = false;
    this.dataSource = [];
    this.rating = [];
    this.canRate = false;
  }

  ngOnInit(): void {
    this.projectSubscription = this.projectQuery.project$.subscribe((value: ProjectModel[]) => {
      if (this.canRate) {
        this.dataSource = value;
      } else {
        const sortedList = value.sort((a, b) => b.stars - a.stars);
        this.dataSource = sortedList.slice(0, 3);
        console.log(this.dataSource);
      }
    });
  }

  ngOnDestroy(): void {
    this.projectSubscription?.unsubscribe();
  }

  public sortColumn(column: number): void {
    switch (column) {
      case 1: {
        this.dataSource = this.dataSource.map(x => ({ item: x, value: x.name })).sort((a, b) => (a.value > b.value) && this.direction ? 1 : -1).map(x => x.item)
        break;
      }
      case 2: {
        this.dataSource = this.dataSource.map(x => ({ item: x, value: x.description })).sort((a, b) => (a.value > b.value) && this.direction ? 1 : -1).map(x => x.item)
        break
      }
      case 3: {
        this.dataSource = this.dataSource.map(x => ({ item: x, value: x.date })).sort((a, b) => (a.value > b.value) && this.direction ? 1 : -1).map(x => x.item)
        break
      }
      case 4: {
        this.dataSource = this.dataSource.map(x => ({ item: x, value: x.stars })).sort((a, b) => (a.value > b.value) && this.direction ? 1 : -1).map(x => x.item)
        break
      }
    }
  }

  public giveLetterName(nome: string): string {
    const iniziali = nome
      .split(' ')
      .map((word) => word.charAt(0))
      .join('').toUpperCase();
    return iniziali;
  }

  public setDirection(event: Sort): void {
    this.direction = !this.direction
  }

  public rate(id: number): void {
    if (this.canRate) {
      let rate = this.ratingQuery.getRating() ? [...this.ratingQuery.getRating()] : [];
      if (rate.find(x => x.id == id)) {
        rate = rate.filter(x => x.id != id);
        const index = this.dataSource.findIndex(x => x.id == id);
        this.dataSource[index] = { ...this.dataSource[index], stars: this.dataSource[index].stars - 1 }
      } else {
        rate.push({ id: id, rating: 1 });
        const index = this.dataSource.findIndex(x => x.id == id);
        this.dataSource[index] = { ...this.dataSource[index], stars: this.dataSource[index].stars + 1 }
      }
      this.ratingStore.update({ rating: rate });
      this.projectStore.update({ project: this.dataSource });
      this.cd.detectChanges();
    }
  }

  public getStars(id: number): number | undefined {
    return this.dataSource.find(x => x.id == id)?.stars;
  }

  public isRated(id: number): boolean {
    const res = this.ratingQuery.getRating() ? this.ratingQuery.getRating().some(x => x.id == id) : false;
    return res;
  }
}
