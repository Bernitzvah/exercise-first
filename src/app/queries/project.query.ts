import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Observable } from 'rxjs';
import { ProjectState, ProjectStore } from '../stores';
import { ProjectModel } from '../models';

@Injectable({ providedIn: 'root' })
export class ProjectQuery extends QueryEntity<ProjectState> {
  public project$: Observable<ProjectModel[]>;

  constructor(
    protected projectStore: ProjectStore
  ) {
    super(projectStore);
    this.project$ = this.select(state => state.project);
  }

  public getProjects(): ProjectModel[] {
    return this.getValue().project;
  }

  public getNextId(): number {
    const oggettoConIdMaggiore = this.getValue().project.reduce((max, current) => (current.id > max.id ? current : max)).id;
    return oggettoConIdMaggiore + 1;
  }
}
