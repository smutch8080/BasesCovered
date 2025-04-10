import React from 'react';
import { Shield } from 'lucide-react';

function CreditsPage() {
  const credits = [
    {
      name: 'React',
      description: 'A JavaScript library for building user interfaces',
      url: 'https://reactjs.org'
    },
    {
      name: 'Tailwind CSS',
      description: 'A utility-first CSS framework',
      url: 'https://tailwindcss.com'
    },
    {
      name: 'Lucide Icons',
      description: 'Beautiful & consistent icons',
      url: 'https://lucide.dev'
    },
    {
      name: 'Firebase',
      description: 'App development platform',
      url: 'https://firebase.google.com'
    },
    {
      name: 'Vite',
      description: 'Next Generation Frontend Tooling',
      url: 'https://vitejs.dev'
    },
    {
      name: 'date-fns',
      description: 'Modern JavaScript date utility library',
      url: 'https://date-fns.org'
    },
    {
      name: 'Zustand',
      description: 'State management solution',
      url: 'https://github.com/pmndrs/zustand'
    },
    {
      name: 'Headless UI',
      description: 'Completely unstyled, fully accessible UI components',
      url: 'https://headlessui.dev'
    },
    {
      name: 'React Hot Toast',
      description: 'Smoking hot React notifications',
      url: 'https://react-hot-toast.com'
    },
    {
      name: 'TinyMCE',
      description: 'Rich text editor',
      url: 'https://www.tiny.cloud'
    },
    {
      name: 'Recharts',
      description: 'A composable charting library built on React components',
      url: 'https://recharts.org'
    },
    {
      name: 'Unsplash',
      description: 'Beautiful, free images and photos',
      url: 'https://unsplash.com'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-brand-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Credits & Acknowledgments</h1>
          <p className="text-gray-600">
            BasesCovered is built with the help of these amazing open source projects and resources.
          </p>
        </div>

        {/* Credits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credits.map((credit) => (
            <a
              key={credit.name}
              href={credit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{credit.name}</h3>
              <p className="text-gray-600">{credit.description}</p>
            </a>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center text-gray-600">
          <p>
            Special thanks to all the maintainers and contributors of these projects that make
            BasesCovered possible.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CreditsPage;