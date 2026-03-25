import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Play, Headphones, Music } from 'lucide-react';

import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './ImageWithFallback';
import {
  resources,
  countByType,
  FEATURED_ALL_COUNT,
  type ResourceType,
} from '../data/resourcesData';

type FilterOption = 'All' | ResourceType;

function getResourceIcon(type: ResourceType) {
  switch (type) {
    case 'Article':
      return <BookOpen className="h-4 w-4" />;
    case 'Video':
      return <Play className="h-4 w-4" />;
    case 'Audio':
      return <Headphones className="h-4 w-4" />;
    case 'Music':
      return <Music className="h-4 w-4" />;
  }
}

function getResourceButton(type: ResourceType) {
  switch (type) {
    case 'Article':
      return 'Read';
    case 'Video':
      return 'Watch';
    case 'Audio':
      return 'Listen';
    case 'Music':
      return 'Play';
  }
}

function getBadgeColor(type: ResourceType) {
  switch (type) {
    case 'Article':
      return 'bg-blue-100 text-blue-700 border-transparent';
    case 'Video':
      return 'bg-purple-100 text-purple-700 border-transparent';
    case 'Audio':
      return 'bg-amber-100 text-amber-800 border-transparent';
    case 'Music':
      return 'bg-pink-100 text-pink-800 border-transparent';
  }
}

export function Resources() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');

  const filteredResources = useMemo(() => {
    if (activeFilter === 'All') {
      return resources.filter((r) => r.featuredInAll);
    }
    return resources.filter((r) => r.type === activeFilter);
  }, [activeFilter]);

  const filters: FilterOption[] = [
    'All',
    'Article',
    'Video',
    'Audio',
    'Music',
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl mb-1 text-foreground">Wellness Resources</h2>
        <p className="text-sm text-muted-foreground">
          Articles, videos, audio, and music to support your mental health
          journey
        </p>
        {activeFilter === 'All' && (
          <p className="text-xs text-muted-foreground mt-2 max-w-2xl">
            <span className="font-medium text-foreground">All Resources</span>{' '}
            shows {FEATURED_ALL_COUNT} curated picks across types. Choose a
            category tab to browse the full library (10 items per category).
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className={`h-8 text-xs ${
              activeFilter === filter
                ? 'bg-[#2d7a8f] hover:bg-[#236272]'
                : 'hover:bg-[#e8f4f7]'
            }`}
          >
            {filter === 'All' && `All Resources (${FEATURED_ALL_COUNT})`}
            {filter === 'Article' &&
              `Articles (${countByType('Article')})`}
            {filter === 'Video' && `Videos (${countByType('Video')})`}
            {filter === 'Audio' && `Audio (${countByType('Audio')})`}
            {filter === 'Music' && `Music (${countByType('Music')})`}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => (
          <Card
            key={resource.id}
            className="overflow-hidden hover:shadow-lg transition-shadow gap-0 py-0"
          >
            <div className="relative h-40 overflow-hidden bg-muted">
              <ImageWithFallback
                src={resource.image}
                alt={resource.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge
                  className={`${getBadgeColor(resource.type)} flex items-center gap-1 text-xs py-0.5`}
                >
                  {getResourceIcon(resource.type)}
                  {resource.type}
                </Badge>
              </div>
              <div className="absolute bottom-2 left-2">
                <Badge
                  variant="secondary"
                  className="bg-black/60 text-white border-0 text-xs py-0.5"
                >
                  {resource.duration}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm">{resource.title}</CardTitle>
              <CardDescription className="line-clamp-2 text-xs">
                {resource.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 pb-4">
              <Button
                className="w-full bg-[#2d7a8f] hover:bg-[#236272] h-8 text-xs"
                asChild
              >
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${getResourceButton(resource.type)}: ${resource.title} (opens in a new tab)`}
                >
                  {getResourceButton(resource.type)} Now
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            No resources found for this category.
          </p>
        </div>
      )}

      <Card className="mt-6 bg-[#e8f4f7] border-[#2d7a8f]/20 gap-4 py-5">
        <CardHeader className="pb-0 px-5 pt-0">
          <CardTitle className="text-base">
            Looking for Something Specific?
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-0">
          <p className="text-xs text-muted-foreground mb-3">
            Can&apos;t find what you&apos;re looking for? Our chatbot can help
            you discover personalized resources based on your needs, or you can
            book a session with one of our counsellors for tailored guidance.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#2d7a8f] text-[#2d7a8f] hover:bg-[#2d7a8f] hover:text-white h-8 text-xs"
              disabled
              title="Coming soon"
            >
              Ask Chatbot
            </Button>
            <Button
              size="sm"
              className="bg-[#2d7a8f] hover:bg-[#236272] h-8 text-xs"
              asChild
            >
              <Link to="/">Book Session</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
