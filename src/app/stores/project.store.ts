import { Injectable } from "@angular/core";
import { EntityState, EntityStore, StoreConfig } from "@datorama/akita";
import { ProjectModel } from "../models";

export interface ProjectState extends EntityState<ProjectModel> {
  project: ProjectModel[];
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'projects', resettable: true })
export class ProjectStore extends EntityStore<ProjectState> {
  constructor() {
    super();
  }
}
