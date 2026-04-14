import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Play, Headphones, Music, type LucideIcon } from 'lucide-react';

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
import { PRIMARY_BUTTON_COLORS } from '../lib/ui';

// Demo resources page:
// filter by content type and open helpful wellness materials.
type FilterOption = 'All' | ResourceType;

const RESOURCE_TYPES: ResourceType[] = ['Article', 'Video', 'Audio', 'Music'];
const FILTER_OPTIONS: FilterOption[] = ['All', ...RESOURCE_TYPES];
const PRIMARY_BUTTON_CLASSES = `${PRIMARY_BUTTON_COLORS} h-8 text-xs`;

type ResourceUi = {
  icon: LucideIcon;
  actionLabel: string;
  badgeClassName: string;
  filterLabel: string;
};

const RESOURCE_TYPE_UI: Record<ResourceType, ResourceUi> = {
  Article: {
    icon: BookOpen,
    actionLabel: 'Read',
    badgeClassName: 'bg-blue-100 text-blue-700 border-transparent',
    filterLabel: 'Articles',
  },
  Video: {
    icon: Play,
    actionLabel: 'Watch',
    badgeClassName: 'bg-purple-100 text-purple-700 border-transparent',
    filterLabel: 'Videos',
  },
  Audio: {
    icon: Headphones,
    actionLabel: 'Listen',
    badgeClassName: 'bg-amber-100 text-amber-800 border-transparent',
    filterLabel: 'Audio',
  },
  Music: {
    icon: Music,
    actionLabel: 'Play',
    badgeClassName: 'bg-pink-100 text-pink-800 border-transparent',
    filterLabel: 'Music',
  },
};

const FILTER_LABELS: Record<FilterOption, string> = {
  All: 'All Resources',
  Article: RESOURCE_TYPE_UI.Article.filterLabel,
  Video: RESOURCE_TYPE_UI.Video.filterLabel,
  Audio: RESOURCE_TYPE_UI.Audio.filterLabel,
  Music: RESOURCE_TYPE_UI.Music.filterLabel,
};

const FILTER_COUNTS: Record<FilterOption, number> = {
  All: FEATURED_ALL_COUNT,
  Article: countByType('Article'),
  Video: countByType('Video'),
  Audio: countByType('Audio'),
  Music: countByType('Music'),
};
const FILTER_BUTTON_ACTIVE_CLASSES = 'bg-[#2d7a8f] hover:bg-[#236272]';
const FILTER_BUTTON_INACTIVE_CLASSES = 'hover:bg-[#e8f4f7]';

function getFilteredResources(activeFilter: FilterOption) {
  return activeFilter === 'All'
    ? resources.filter((resource) => resource.featuredInAll)
    : resources.filter((resource) => resource.type === activeFilter);
}

export function Resources() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const filteredResources = getFilteredResources(activeFilter);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl mb-1 text-foreground">Wellness Library</h2>
        <p className="text-sm text-muted-foreground">
          Explore articles, videos, audio, and music for daily mental wellness support.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTER_OPTIONS.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className={`h-8 text-xs ${
              activeFilter === filter
                ? FILTER_BUTTON_ACTIVE_CLASSES
                : FILTER_BUTTON_INACTIVE_CLASSES
            }`}
          >
            {`${FILTER_LABELS[filter]} (${FILTER_COUNTS[filter]})`}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => {
          const typeUi = RESOURCE_TYPE_UI[resource.type];
          const TypeIcon = typeUi.icon;
          return (
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
                    className={`${typeUi.badgeClassName} flex items-center gap-1 text-xs py-0.5`}
                  >
                    <TypeIcon className="h-4 w-4" />
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
                <Button className={`w-full ${PRIMARY_BUTTON_CLASSES}`} asChild>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${typeUi.actionLabel}: ${resource.title} (opens in a new tab)`}
                  >
                    {typeUi.actionLabel} Now
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            No resources found for this category.
          </p>
        </div>
      )}
      <div className="mt-6">
        <Button size="sm" className={PRIMARY_BUTTON_CLASSES} asChild>
          <Link to="/appointments/book">Book a Session</Link>
        </Button>
      </div>
    </div>
  );
}
