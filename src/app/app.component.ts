import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectModel, RatingModel } from './models';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RatingQuery } from './queries/rating.query';
import { ProjectStore, RatingStore } from './stores';
import { ProjectQuery } from './queries';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit, OnDestroy {
  public projectForm: FormGroup;

  public list: ProjectModel[];
  public ratedList: RatingModel[];
  public top3Projects: ProjectModel[];
  public isModalVisible: boolean;

  public sortedList: ProjectModel[];

  private projectSubscription: Subscription | undefined;
  private ratingSubscription: Subscription | undefined;


  constructor(
    private ratingQuery: RatingQuery,
    private ratingStore: RatingStore,
    private projectStore: ProjectStore,
    private projectQuery: ProjectQuery
  ) {
    this.isModalVisible = false;
    this.list = [];
    this.ratedList = [];
    this.top3Projects = [];
    if (!this.projectQuery.getProjects()) {
      this.list = [
        {
          id: 1,
          name: "Awesome project",
          description: "Lorem ipsum dolor sit amet",
          date: "2020-10-11",
          stars: 100
        },
        {
          id: 2,
          name: "Rocket project",
          description: "Dolor sit amet",
          date: "2020-10-12",
          stars: 120
        },
        {
          id: 3,
          name: "Bull project",
          description: "Ipsum lorem sit",
          date: "2020-09-10",
          stars: 80
        },
        {
          id: 4,
          name: "Greek project",
          description: "Felicit ipsum dolor",
          date: "2020-08-12",
          stars: 80
        }
      ];
      this.projectStore.update({ project: [...this.list] });
    } else {
      this.list = [...this.projectQuery.getProjects()];
      this.sortedList = [...this.projectQuery.getProjects()];
      this.projectStore.update({ project: [...this.list] });
    }

    if (this.ratingQuery.getRating()) {
      this.ratedList = [...this.ratingQuery.getRating()];
    }

    this.sortedList = [...this.list];
    this.projectForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.projectSubscription = this.projectQuery.project$.subscribe((value: ProjectModel[]) => {
      this.sortedList = this.list;
    });

    this.ratingSubscription = this.ratingQuery.rating$.subscribe((value: RatingModel[]) => {
      if (value) {
        this.ratedList = [...value];
      }
      this.getTop3MostRatedProjects();
    })
  }

  ngOnDestroy(): void {
    this.projectSubscription?.unsubscribe();
    this.ratingSubscription?.unsubscribe();
  }

  public addNewProject(): void {
    this.isModalVisible = !this.isModalVisible;
  }

  public closeAddProject(): void {
    this.isModalVisible = !this.isModalVisible;
  }

  public getTop3MostRatedProjects(): ProjectModel[] {
    const idToRatingsCount: { [id: number]: number } = {};

    this.ratedList.forEach(rating => {
      const id = rating.id;
      idToRatingsCount[id] = (idToRatingsCount[id] || 0) + rating.rating;
    });
    const updatedList = this.list.map(project => {
      const id = project.id;
      const existingStars = project.stars || 0;
      const newStars = idToRatingsCount[id] || 0;
      const updatedProject = { ...project, stars: existingStars + newStars };
      return updatedProject;
    });
    const sortedList = updatedList.sort((a, b) => b.stars - a.stars);
    this.top3Projects = sortedList.slice(0, 3);
    return this.top3Projects;
  }

  onInputChange(event: any) {
    if (!event.target.value) {
      this.sortedList = this.list;
    } else {
      this.sortedList = this.list.filter(item =>
        item.name.toLowerCase().includes(event.target.value.toLowerCase())
      );
    }
  }

  public addProject(): void {
    const progressiveId = this.projectQuery.getNextId();
    const formattedDate = this.formatDate(new Date());
    const title = this.projectForm.value['title'];
    const description = this.projectForm.value['description'];
    const stars = 0;
    const project: ProjectModel = { id: progressiveId, name: title, description: description, date: formattedDate, stars: stars }
    this.list.push(project)
    this.projectStore.update({ project: [...this.list] });
    this.isModalVisible = false;
    this.projectForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required])
    });
  }

  private formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public deleteAll(): void {
    this.ratingStore.reset();
    this.projectStore.reset();
    location.reload();
  }

}
