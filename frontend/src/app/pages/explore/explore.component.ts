import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostComponent, Post, User } from '../../components/post/post.component';
import { PostService, PostResponse } from '../../services/post.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, PostComponent],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {
  searchQuery = '';
  private postService = inject(PostService);

  randomPosts: { post: Post, user: User }[] = [];

  trends = [
    { category: 'Népszerű itt: Magyarország', title: 'Romania' },
    { category: 'Sport · Népszerű', title: '#Formula1' },
    { category: 'Népszerű itt: Magyarország', title: 'fideszt' },
    { category: 'Népszerű itt: Magyarország', title: 'Helyes' },
    { category: 'Népszerű itt: Magyarország', title: '#XRPs' },
    { category: 'Népszerű itt: Magyarország', title: 'Get Ready' },
    { category: 'Népszerű itt: Magyarország', title: 'karácsony' },
    { category: 'Népszerű itt: Magyarország', title: '#maenoburger' },
    { category: 'Népszerű itt: Magyarország', title: 'tiszások' },
    { category: 'Népszerű itt: Magyarország', title: 'Budapesten' },
    { category: 'Népszerű itt: Magyarország', title: 'Kanna' },
    { category: 'Népszerű itt: Magyarország', title: 'Big $XRP' }
  ];

  ngOnInit() {
    this.postService.getPosts().subscribe({
      next: (data: PostResponse[]) => {
        this.randomPosts = data.map(pr => this.mapPostResponse(pr));
      },
      error: (err) => {
        console.error('Error loading explore posts', err);
      }
    });
  }

  // Maps the backend response to the component's internal interfaces
  private mapPostResponse(pr: PostResponse): { post: Post, user: User } {
    return {
      post: {
        id: pr.id,
        content: pr.content,
        timestamp: new Date(pr.created_at).toLocaleString(),
        isBookmarked: false,
        hashtags: [],
        likes: 0,
        isLiked: false,
        reposts: 0,
        isReposted: false,
        views: 0
      },
      user: {
        displayName: pr.owner.username,
        username: `@${pr.owner.username}`,
        profileImage: 'https://i.pravatar.cc/150?u=' + pr.owner.id
      }
    };
  }
}
