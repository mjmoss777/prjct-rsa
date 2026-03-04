import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ResumeATS — ATS Resume Checker & Builder',
    short_name: 'ResumeATS',
    description: 'Check your resume against ATS systems and build optimized resumes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F0E8',
    theme_color: '#2D5A3D',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
