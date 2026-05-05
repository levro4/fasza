import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostComponent } from '../../components/post/post.component';
import { PostService, PostWithUser } from '../../services/post.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, PostComponent],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent {
  searchQuery = '';
  private postService = inject(PostService);

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

  get randomPosts(): PostWithUser[] {
    // Szűrés, hogy csak az explore posztjai jelenjenek meg (id 101, 102, 103)
    return this.postService.getPosts().filter(p => [101, 102, 103].includes(p.post.id));
  }
}
