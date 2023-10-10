import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Observable } from 'rxjs';
import { RatingState, RatingStore } from '../stores';
import { RatingModel } from '../models';

@Injectable({ providedIn: 'root' })
export class RatingQuery extends QueryEntity<RatingState> {
  public rating$: Observable<RatingModel[]>;

  constructor(
    protected ratingStore: RatingStore
  ) {
    super(ratingStore);
    this.rating$ = this.select(state => state.rating);
  }

  public getRating(): RatingModel[] {
    return this.getValue().rating;
  }

}
