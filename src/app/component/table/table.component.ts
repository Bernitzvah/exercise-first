import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { ProjectModel, RatingModel } from 'src/app/models';
import { MatSort, Sort } from '@angular/material/sort';
import { ProjectQuery, RatingQuery } from 'src/app/queries';
import { Subscription } from 'rxjs';
import { RatingStore } from 'src/app/stores';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.less']
})

export class TableComponent implements OnDestroy{

  @ViewChild(MatSort) sort!: MatSort;

  @Input()
  public dataSource: ProjectModel[];

  @Input()
  public rating: RatingModel[];

  @Input()
  public canRate: boolean;

  displayedColumns: string[] = ['name', 'description', 'date', 'stars'];

  private direction: boolean;

  private projectSubscription: Subscription | undefined;

  constructor(
    private projectQuery: ProjectQuery,
    private ratingStore: RatingStore,
    private ratingQuery: RatingQuery
  ) {
    this.direction = false;
    this.dataSource = [];
    this.rating = [];
    this.canRate = false;

    this.projectSubscription = this.projectQuery.project$.subscribe((value: ProjectModel[]) => {
      if (this.canRate) {
        this.dataSource = value;
      } else {
        const sortedList = value.sort((a, b) => b.stars - a.stars);
        this.dataSource = sortedList.slice(0, 3);
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
    if(this.canRate) {
      let rate = this.ratingQuery.getRating() ? [...this.ratingQuery.getRating()] : [];
      if (rate.find(x => x.id == id)) {
        rate = rate.filter(x => x.id != id);
      } else {
        rate.push({id: id, rating: 1});
      }
      this.ratingStore.update({rating: rate});
    }
  }

  public getStars(initialStars: number, id: number): number {
    const count = this.ratingQuery.getRating() ? this.ratingQuery.getRating().filter(item => item.id === id).length : 0;
    return this.canRate? initialStars + count : initialStars;
  }

  public isRated(id: number): boolean {
    const res = this.ratingQuery.getRating() ? this.ratingQuery.getRating().some(x => x.id == id) : false;
    return res;
  }
}
