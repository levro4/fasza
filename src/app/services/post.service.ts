import { Injectable } from '@angular/core';
import { Post, User } from '../components/post/post.component';

export interface PostWithUser {
  post: Post;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private allPosts: PostWithUser[] = [
    // John Doe's posts (from Profile)
    {
      post: { id: 1, content: 'This is my first post on FakeTwitter! Excited to be here.', timestamp: '2h', isBookmarked: false, hashtags: [] },
      user: { displayName: 'John Doe', username: '@johndoe', profileImage: 'https://i.pravatar.cc/150?img=11' }
    },
    {
      post: { id: 2, content: 'Just setting up my new profile. What do you think about the new banner?', timestamp: '5h', isBookmarked: true, hashtags: [] },
      user: { displayName: 'John Doe', username: '@johndoe', profileImage: 'https://i.pravatar.cc/150?img=11' }
    },
    {
      post: { id: 3, content: 'Angular is such a powerful framework for building web apps. #Angular #WebDev', timestamp: '1d', isBookmarked: false, hashtags: ['#Angular', '#WebDev'] },
      user: { displayName: 'John Doe', username: '@johndoe', profileImage: 'https://i.pravatar.cc/150?img=11' }
    },
    // Random posts (from Explore)
    {
      post: { id: 101, content: 'Learning Angular is so much fun!', timestamp: '4h', isBookmarked: false, hashtags: [] },
      user: { displayName: 'Angular Dev', username: '@ng_lover', profileImage: 'https://i.pravatar.cc/150?img=33' }
    },
    {
      post: { id: 102, content: 'Anyone else watching the race this weekend? #Formula1', timestamp: '12h', isBookmarked: false, hashtags: ['#Formula1'] },
      user: { displayName: 'F1 Fanatic', username: '@racingfan', profileImage: 'https://i.pravatar.cc/150?img=59' }
    },
    {
      post: { id: 103, content: 'Budapest is beautiful during the winter. Highly recommend visiting! #Hungary', timestamp: '1d', isBookmarked: false, hashtags: ['#Hungary'] },
      user: { displayName: 'Travel Explorer', username: '@wanderlust', profileImage: 'https://i.pravatar.cc/150?img=12' }
    }
  ];

  private comments: { [key: number]: PostWithUser[] } = {
    1: [
      {
        post: { id: 201, content: 'Welcome to the platform!', timestamp: '1h', isBookmarked: false },
        user: { displayName: 'Friendly User', username: '@friendly', profileImage: 'https://i.pravatar.cc/150?img=1' }
      }
    ],
    102: [
      {
        post: { id: 202, content: 'Yes! Can\'t wait for the qualifying session. #F1', timestamp: '11h', isBookmarked: false, hashtags: ['#F1'] },
        user: { displayName: 'Speed Demon', username: '@speedy', profileImage: 'https://i.pravatar.cc/150?img=2' }
      },
      {
        post: { id: 203, content: 'Hoping my favorite driver wins!', timestamp: '10h', isBookmarked: false },
        user: { displayName: 'Another Fan', username: '@fan2', profileImage: 'https://i.pravatar.cc/150?img=3' }
      }
    ]
  };

  constructor() { }

  getPosts(): PostWithUser[] {
    return this.allPosts;
  }

  getPostById(id: number): PostWithUser | undefined {
    return this.allPosts.find(p => p.post.id === id);
  }

  getCommentsForPost(postId: number): PostWithUser[] {
    return this.comments[postId] || [];
  }
}
