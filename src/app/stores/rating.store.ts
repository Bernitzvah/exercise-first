import { Injectable } from "@angular/core";
import { EntityState, EntityStore, StoreConfig } from "@datorama/akita";
import { RatingModel } from "../models";

export interface RatingState extends EntityState<RatingModel> {
  rating: RatingModel[];
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'rating', resettable: true })
export class RatingStore extends EntityStore<RatingState> {
  constructor() {
    super();
  }
}
