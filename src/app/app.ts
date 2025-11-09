import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import { CREATE_POST, DELETE_POST, GET_POSTS, UPDATE_POST } from './queries/posts';
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

  onDelete(postId: number) {
    console.log('Deleting post with id', postId);

    if (!confirm('Delete post with id ' + postId + '?')) return;
    return this.apollo
      .mutate<{ deletePost: string }>({
        mutation: DELETE_POST,
        variables: { postId },
        optimisticResponse: {
          deletePost: 'success',
        },
        update: (cache) => {
          const existing = cache.readQuery<{ posts: any[] }>({
            query: GET_POSTS,
          });

          if (!existing) return;

          cache.writeQuery({
            query: GET_POSTS,
            data: {
              posts: existing.posts.filter((p) => p.id !== postId),
            },
          });
        },
      })
      .subscribe({
        next: (res) => {
          alert(res.data?.deletePost);
          console.log('Delete response', res.data?.deletePost);
        },
        error: (err) => {
          console.error('Delete error', err);
        },
      });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const post = this.form.value;
    console.log(post, 'form value');

    const title = (post.title || '').trim();
    const postId = Number(post.id);
    if (!title) return;
    if (post.id) {
      delete this.form.value.id;
      return this.apollo
        .mutate<{ updatePost: any }>({
          mutation: UPDATE_POST,
          variables: { postId, post },
          optimisticResponse: {
            updatePost: { __typename: 'Post', id: postId, title: post.title ?? '' },
          },
          update: (cache, { data }) => {
            if (!data?.updatePost) return;
            const existing = cache.readQuery<{ posts: any[] }>({ query: GET_POSTS });
            if (!existing) return;
            cache.writeQuery({
              query: GET_POSTS,
              data: {
                posts: existing.posts.map((p) => (p.id === postId ? data.updatePost : p)),
              },
            });
          },
        })
        .subscribe({
          next: (res) => {
            alert('Post updated with id ' + res.data?.updatePost.id);
            this.reset();
            console.log('Update response', res.data?.updatePost);
          },
          error: (err) => {
            console.error('Update error', err);
          },
        });
    } else {
      console.log(post, 'creating post');
      const payload = { title: post.title, body: post.body, userId: 2 };
      console.log(payload, 'payload');

      return this.apollo
        .mutate<{ createPost: any }>({
          mutation: CREATE_POST,
          variables: { post: payload },
          optimisticResponse: {
            createPost: {
              __typename: 'Post',
              id: Math.floor(Math.random() * 1e9), // temp client id
              title: post.title,
            },
          },
          update: (cache, { data }) => {
            if (!data?.createPost) return;
            const existing = cache.readQuery<{ posts: any[] }>({ query: GET_POSTS });
            cache.writeQuery({
              query: GET_POSTS,
              data: { posts: [data.createPost, ...(existing?.posts ?? [])] },
            });
          },
        })
        .subscribe({
          next: (res) => {
            alert('Post created with id ' + res.data?.createPost.id);
            this.reset();
            console.log('Create response', res.data?.createPost);
          },
          error: (err) => {
            console.error('Create error', err);
          },
        });
    }
  }

  reset() {
    this.form.reset({ id: 0, title: '' });
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }
}
