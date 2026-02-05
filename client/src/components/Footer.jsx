import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold text-white text-lg">ScholarSync</div>
            <div className="text-sm">Fakultet primijenjene matematike i informatike Osijek</div>
          </div>
          <div className="text-sm">&copy; {new Date().getFullYear()} ScholarSync</div>
        </div>
      </div>
    </footer>
  ) 
}
