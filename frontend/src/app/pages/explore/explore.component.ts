import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostComponent } from '../../components/post/post.component';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { User } from '../../models/user.model';

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
      next: (data: Post[]) => {
        this.randomPosts = data.map(pr => this.mapPostResponse(pr));
      },
      error: (err) => {
        console.error('Error loading explore posts', err);
      }
    });
  }

  // Maps the backend response to the component's internal interfaces
  private mapPostResponse(pr: Post): { post: Post, user: User } {
    return {
      post: {
        id: pr.id,
        content: pr.content,
        created_at: pr.created_at ? new Date(pr.created_at).toLocaleString() : '',
        owner: pr.owner,
        owner_id: pr.owner_id,
        isBookmarked: false,
        hashtags: [],
        likes: 0,
        isLiked: false,
        reposts: 0,
        isReposted: false,
        views: 0
      },
      user: {
        displayName: pr.owner?.username || 'Unknown',
        username: `@${pr.owner?.username || 'unknown'}`,
        profileImage: 'https://i.pravatar.cc/150?u=' + (pr.owner?.id || 1)
      }
    };
  }
}
