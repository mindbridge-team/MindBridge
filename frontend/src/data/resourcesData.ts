export type ResourceType = 'Article' | 'Video' | 'Audio' | 'Music';

export type Resource = {
  id: number;
  title: string;
  description: string;
  type: ResourceType;
  duration: string;
  image: string;
  url: string;
  /** When true, included in the "All Resources" view (curated subset). */
  featuredInAll: boolean;
};

/** Unsplash / thematic thumbnails (verified HTTP 200). */
const img = {
  ocean: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=1080&q=80&fm=jpg',
  mood: 'https://images.unsplash.com/photo-1758273240360-76b908e7582a?w=1080&q=80&fm=jpg',
  sleep: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1080&q=80&fm=jpg',
  sunrise: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&q=80&fm=jpg',
  tea: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1080&q=80&fm=jpg',
  hands: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080&q=80&fm=jpg',
  wellness: 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?w=1080&q=80&fm=jpg',
  path: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1080&q=80&fm=jpg',
  brain: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1080&q=80&fm=jpg',
  journal: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=1080&q=80&fm=jpg',
  studio: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1080&q=80&fm=jpg',
  piano: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1080&q=80&fm=jpg',
  sound: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=1080&q=80&fm=jpg',
  headphones: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&q=80&fm=jpg',
  nature: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&q=80&fm=jpg',
  yoga: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1080&q=80&fm=jpg',
  library: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1080&q=80&fm=jpg',
} as const;

function ytThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export const resources: Resource[] = [
  // —— Articles (10) ——
  {
    id: 1,
    title: 'Breathing & Relaxation Techniques',
    description:
      'Evidence-based breath control and relaxation practices from Harvard Health Publishing.',
    type: 'Article',
    duration: '8 min read',
    image: img.ocean,
    url: 'https://www.health.harvard.edu/mind-and-mood/relaxation-techniques-breath-control-helps-quell-errant-stress-response',
    featuredInAll: true,
  },
  {
    id: 2,
    title: 'Understanding Anxiety',
    description:
      'Symptoms, risk factors, and treatments for anxiety disorders (NIMH).',
    type: 'Article',
    duration: '8 min read',
    image: img.mood,
    url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
    featuredInAll: true,
  },
  {
    id: 3,
    title: 'Sleep Hygiene Tips',
    description:
      'How sleep works and habits that support better rest (CDC).',
    type: 'Article',
    duration: '6 min read',
    image: img.sleep,
    url: 'https://www.cdc.gov/sleep/about/index.html',
    featuredInAll: true,
  },
  {
    id: 4,
    title: 'Depression: Signs & Treatment',
    description:
      'Overview of depression, treatment options, and finding help (NIMH).',
    type: 'Article',
    duration: '10 min read',
    image: img.sunrise,
    url: 'https://www.nimh.nih.gov/health/topics/depression',
    featuredInAll: false,
  },
  {
    id: 5,
    title: 'Stress: Effects & Coping',
    description:
      'Stress effects on mind and body and healthy coping strategies (APA).',
    type: 'Article',
    duration: '12 min read',
    image: img.tea,
    url: 'https://www.apa.org/topics/stress',
    featuredInAll: false,
  },
  {
    id: 6,
    title: 'SAMHSA National Helpline (988)',
    description:
      'How to reach free, confidential mental health and substance-use support.',
    type: 'Article',
    duration: '5 min read',
    image: img.hands,
    url: 'https://www.samhsa.gov/find-help/national-helpline',
    featuredInAll: true,
  },
  {
    id: 7,
    title: 'What Is Mental Health?',
    description:
      'Basics, early warning signs, and wellness (MentalHealth.gov).',
    type: 'Article',
    duration: '6 min read',
    image: img.wellness,
    url: 'https://www.mentalhealth.gov/basics/what-is-mental-health',
    featuredInAll: false,
  },
  {
    id: 8,
    title: 'Meditation & Mindfulness (Science)',
    description:
      'What research says about meditation and mindfulness (NCCIH).',
    type: 'Article',
    duration: '10 min read',
    image: img.path,
    url: 'https://www.nccih.nih.gov/health/meditation-and-mindfulness-what-you-need-to-know',
    featuredInAll: false,
  },
  {
    id: 9,
    title: 'Bipolar Disorder',
    description:
      'Symptoms, diagnosis, and treatment overview (NIMH).',
    type: 'Article',
    duration: '10 min read',
    image: img.brain,
    url: 'https://www.nimh.nih.gov/health/topics/bipolar-disorder',
    featuredInAll: false,
  },
  {
    id: 10,
    title: 'PTSD',
    description:
      'Post-traumatic stress: signs, risk factors, and care (NIMH).',
    type: 'Article',
    duration: '10 min read',
    image: img.journal,
    url: 'https://www.nimh.nih.gov/health/topics/post-traumatic-stress-disorder-ptsd',
    featuredInAll: false,
  },

  // —— Videos (10) —— YouTube thumbnails
  {
    id: 11,
    title: 'Daily Calm: Mindfulness',
    description:
      "Ten-minute 'be present' mindfulness practice from Calm's YouTube channel.",
    type: 'Video',
    duration: '10 min',
    image: ytThumb('ZToicYcHIOU'),
    url: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
    featuredInAll: true,
  },
  {
    id: 12,
    title: '5-Minute Meditation (Anywhere)',
    description: 'Quick guided meditation from Goodful.',
    type: 'Video',
    duration: '5 min',
    image: ytThumb('inpok4MKVLM'),
    url: 'https://www.youtube.com/watch?v=inpok4MKVLM',
    featuredInAll: true,
  },
  {
    id: 13,
    title: 'Gentle Yoga for Beginners',
    description: 'At-home yoga with Yoga With Adriene.',
    type: 'Video',
    duration: '20 min',
    image: ytThumb('v7AYKMP6rOE'),
    url: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
    featuredInAll: false,
  },
  {
    id: 14,
    title: '10-Minute Meditation for Anxiety',
    description: 'Goodful guided session for anxious moments.',
    type: 'Video',
    duration: '10 min',
    image: ytThumb('O-6f5wQXSu8'),
    url: 'https://www.youtube.com/watch?v=O-6f5wQXSu8',
    featuredInAll: false,
  },
  {
    id: 15,
    title: 'Managing Stress (Brainsmart)',
    description: 'BBC Bitesize-style explainer on stress and the brain.',
    type: 'Video',
    duration: '≈5 min',
    image: ytThumb('hnpQrMqDoqE'),
    url: 'https://www.youtube.com/watch?v=hnpQrMqDoqE',
    featuredInAll: false,
  },
  {
    id: 16,
    title: 'Mindfulness for Beginners',
    description:
      'Short guided meditation to relax and recharge—good first step into mindfulness (Breethe).',
    type: 'Video',
    duration: '5 min',
    image: ytThumb('8Xdwr4cRTVA'),
    url: 'https://www.youtube.com/watch?v=8Xdwr4cRTVA',
    featuredInAll: false,
  },
  {
    id: 17,
    title: 'Relaxing Stretch & Breath',
    description:
      'Gentle movement and breathing in a 10-minute beginner practice (Yoga With Adriene).',
    type: 'Video',
    duration: '10 min',
    image: ytThumb('j7rKKpwdXNE'),
    url: 'https://www.youtube.com/watch?v=j7rKKpwdXNE',
    featuredInAll: false,
  },
  {
    id: 18,
    title: 'Calm Body Scan',
    description: 'Slow body-scan style relaxation (video).',
    type: 'Video',
    duration: '≈10 min',
    image: ytThumb('c1Ndym-IsQg'),
    url: 'https://www.youtube.com/watch?v=c1Ndym-IsQg',
    featuredInAll: false,
  },
  {
    id: 19,
    title: 'Morning Stretch & Energy',
    description:
      'Full-body stretch to wake up—10-minute morning flow (Yoga with Kassandra).',
    type: 'Video',
    duration: '10 min',
    image: ytThumb('4pKly2JojMw'),
    url: 'https://www.youtube.com/watch?v=4pKly2JojMw',
    featuredInAll: false,
  },
  {
    id: 20,
    title: 'Wind-Down Relaxation',
    description: 'Evening relaxation and breathing (video).',
    type: 'Video',
    duration: '≈12 min',
    image: ytThumb('tEmt1Znux58'),
    url: 'https://www.youtube.com/watch?v=tEmt1Znux58',
    featuredInAll: false,
  },

  // —— Audio (10) ——
  {
    id: 21,
    title: 'APA Psychology Podcasts',
    description: 'American Psychological Association podcast hub.',
    type: 'Audio',
    duration: 'Series',
    image: img.studio,
    url: 'https://www.apa.org/podcasts',
    featuredInAll: true,
  },
  {
    id: 22,
    title: 'Hidden Brain',
    description:
      'NPR series on the hidden patterns that drive human behavior, emotions, and choices.',
    type: 'Audio',
    duration: 'Series',
    image: img.sound,
    url: 'https://www.npr.org/series/423302056/hidden-brain',
    featuredInAll: true,
  },
  {
    id: 23,
    title: 'Invisibilia',
    description:
      'NPR show on the unseen forces—from beliefs to emotions—that shape mental life.',
    type: 'Audio',
    duration: 'Series',
    image: img.library,
    url: 'https://www.npr.org/podcasts/510307/invisibilia',
    featuredInAll: false,
  },
  {
    id: 24,
    title: 'Life Kit',
    description:
      'NPR’s practical guide to navigating stress, relationships, sleep, and everyday wellbeing.',
    type: 'Audio',
    duration: 'Series',
    image: img.studio,
    url: 'https://www.npr.org/podcasts/510309/life-kit',
    featuredInAll: false,
  },
  {
    id: 25,
    title: 'DBSA Podcasts',
    description:
      'Depression and Bipolar Support Alliance: hope-focused conversations on mood and recovery.',
    type: 'Audio',
    duration: 'Series',
    image: img.wellness,
    url: 'https://www.dbsalliance.org/podcasts/',
    featuredInAll: false,
  },
  {
    id: 26,
    title: 'Mental Health Foundation (UK) Podcasts',
    description: 'Conversations on mental health and wellbeing.',
    type: 'Audio',
    duration: 'Series',
    image: img.headphones,
    url: 'https://www.mentalhealth.org.uk/explore-mental-health/podcasts',
    featuredInAll: false,
  },
  {
    id: 27,
    title: 'Mindful Magazine Podcasts',
    description:
      'Interviews and teachings on mindfulness, compassion, and emotional balance.',
    type: 'Audio',
    duration: 'Series',
    image: img.studio,
    url: 'https://www.mindful.org/category/podcasts/',
    featuredInAll: false,
  },
  {
    id: 28,
    title: 'NPR Health',
    description:
      'Reporting on mental health, brain science, and emotional wellbeing from NPR.',
    type: 'Audio',
    duration: 'Ongoing',
    image: img.sound,
    url: 'https://www.npr.org/sections/health/',
    featuredInAll: false,
  },
  {
    id: 29,
    title: 'On Being',
    description:
      'Krista Tippett on meaning, inner life, healing, and what it is to be human.',
    type: 'Audio',
    duration: 'Series',
    image: img.headphones,
    url: 'https://www.npr.org/podcasts/510208/on-being',
    featuredInAll: false,
  },
  {
    id: 30,
    title: 'Speaking of Psychology',
    description:
      'APA podcast: evidence-based psychology on emotions, therapy, stress, and healthy habits.',
    type: 'Audio',
    duration: 'Series',
    image: img.library,
    url: 'https://www.apa.org/news/podcasts/speaking-of-psychology',
    featuredInAll: false,
  },

  // —— Music (10) —— Spotify / streaming
  {
    id: 31,
    title: 'Peaceful Meditation',
    description: 'Instrumental Spotify playlist for calm focus.',
    type: 'Music',
    duration: 'Playlist',
    image: img.piano,
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ',
    featuredInAll: true,
  },
  {
    id: 32,
    title: 'Calm Down',
    description: 'Relaxing tracks to slow your mind.',
    type: 'Music',
    duration: 'Playlist',
    image: img.headphones,
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
    featuredInAll: true,
  },
  {
    id: 33,
    title: 'Stress Relief',
    description: 'Spotify’s stress-relief mix.',
    type: 'Music',
    duration: 'Playlist',
    image: img.nature,
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa',
    featuredInAll: false,
  },
  {
    id: 34,
    title: 'Jazz for Calm Focus',
    description:
      'Instrumental jazz for a steady, low-stress backdrop while you work or unwind.',
    type: 'Music',
    duration: 'Playlist',
    image: img.piano,
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFvBkY',
    featuredInAll: false,
  },
  {
    id: 35,
    title: 'Deep Focus (Ambient)',
    description:
      'Ambient and electronic textures to ease anxiety and support sustained attention.',
    type: 'Music',
    duration: 'Playlist',
    image: img.library,
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWSiZVO2J6WeI',
    featuredInAll: false,
  },
  {
    id: 36,
    title: 'Ambient Relaxation',
    description: 'Spotify editorial ambient picks.',
    type: 'Music',
    duration: 'Playlist',
    image: img.ocean,
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX6GwdWRQMQpq',
    featuredInAll: false,
  },
  {
    id: 37,
    title: 'Peaceful Meditation (Instrumentals)',
    description:
      'Spotify’s editorial meditation mix—soft instrumentals for breathing practice and calm.',
    type: 'Music',
    duration: 'Playlist',
    image: img.sound,
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u',
    featuredInAll: false,
  },
  {
    id: 38,
    title: 'Chillout Lounge',
    description:
      'Down-tempo tracks to soften stress and create a gentler emotional backdrop.',
    type: 'Music',
    duration: 'Playlist',
    image: img.headphones,
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS',
    featuredInAll: false,
  },
  {
    id: 39,
    title: 'Weightless (Ambient)',
    description:
      'Marconi Union’s ambient album often used in relaxation research—deep, slow listening.',
    type: 'Music',
    duration: 'Album',
    image: img.yoga,
    url: 'https://open.spotify.com/album/3d8apQ32ZVRDPFtllVTKGR',
    featuredInAll: false,
  },
  {
    id: 40,
    title: 'Album: Calm Instrumentals',
    description: 'Full album listening on Spotify (instrumental).',
    type: 'Music',
    duration: 'Album',
    image: img.piano,
    url: 'https://open.spotify.com/album/1ATL5GLyefJaxhQzSPVrLX',
    featuredInAll: false,
  },
];

export const FEATURED_ALL_COUNT = resources.filter((r) => r.featuredInAll).length;

/** Same curated set as Resources → “All Resources”; first `limit` items for the dashboard preview. */
export function getDashboardFeaturedResources(limit = 3): Resource[] {
  return resources.filter((r) => r.featuredInAll).slice(0, limit);
}

export function countByType(type: ResourceType): number {
  return resources.filter((r) => r.type === type).length;
}
