import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import { GET_POSTS } from './queries/posts';
import { Subscription } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('graphQL-demo');
  private apollo = inject(Apollo);
  private fb = inject(FormBuilder);
  loading!: boolean;
  posts = signal<any>([]);
  postsQuery!: QueryRef<any>;
  private querySubscription!: Subscription;

  form = this.fb.group({
    id: [0],
    title: ['', Validators.required],
    body: ['', Validators.required],
  });

  ngOnInit() {
    this.postsQuery = this.apollo.watchQuery<any>({
      query: GET_POSTS,
      // pollInterval: 500,
    });
    this.querySubscription = this.postsQuery.valueChanges.subscribe(({ data, loading }) => {
      console.log(data.posts);

      this.loading = loading;
      this.posts.set(data.posts);
    });
  }

  refresh() {
    this.postsQuery.refetch();
  }

  startEdit(p: any) {
    this.form.setValue({ id: p.id, title: p.title, body: p.body });
  }

  onDelete(id: number) {
    if (!confirm('Delete post with id ' + id + '?')) return;
    // this.postsService.delete(id);
  }

  onSubmit() {
    // if (this.form.invalid) return;
    // const val = this.form.value;
    // const title = (val.title || '').trim();
    // if (!title) return;
    // if (val.id && val.id > 0) {
    //   this.postsService.update({ id: val.id, title });
    // } else {
    //   this.postsService.add({ id: this.postsService.nextId(), title });
    // }
    // this.reset();
  }

  reset() {
    this.form.reset({ id: 0, title: '' });
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }
}
