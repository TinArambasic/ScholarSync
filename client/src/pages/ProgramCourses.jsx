import React from 'react'
import { useParams, Link } from 'react-router-dom'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { usePageLoading } from '../hooks/usePageLoading'
import YearCard from '../components/YearCard'

export default function ProgramCourses() {
  const { studyType, programId } = useParams()
  const isLoading = usePageLoading()

  const programNames = {
    'preddiplomski': {
      'matematika': 'Matematika',
      'matematika-racunarstvo': 'Matematika i računarstvo'
    },
    'diplomski': {
      'matematika-racunarstvo': 'Matematika i računarstvo',
      'financijska-matematika': 'Financijska matematika i statistika',
      'nastavnicki-matematika-informatika': 'Nastavnički studij matematike i informatike'
    }
  }

  const programName = programNames[studyType]?.[programId] || 'Program'
  const studyTypeName = studyType === 'preddiplomski' ? 'Prijediplomski studij' : 'Diplomski studij'
  const years = studyType === 'preddiplomski'
    ? [
        { year: 1, name: '1. godina', description: 'Temeljni kolegiji prve godine' },
        { year: 2, name: '2. godina', description: 'Napredniji kolegiji druge godine' },
        { year: 3, name: '3. godina', description: 'Specijalizacija i završni kolegiji' }
      ]
    : [
        { year: 4, name: '4. godina', description: 'Prva godina diplomskog studija' },
        { year: 5, name: '5. godina', description: 'Druga godina diplomskog studija' }
      ]

  return (
    <>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="bg-gray-50 py-4">
          <div className="container mx-auto max-w-6xl px-4">
            {/* Header */}
            <div className="mb-8">
              <Link to={`/study-types/${studyType}`} className="text-primary-600 hover:text-primary-700 font-medium mb-4 inline-block">
                ← Natrag na {studyTypeName}
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{programName}</h1>
              <p className="text-gray-600">{studyTypeName}</p>
            </div>

            {/* Years */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {years.map(y => (
                <YearCard
                  key={y.year}
                  year={y.year}
                  name={y.name}
                  description={y.description}
                  linkTo={`/programs/${studyType}/${programId}/years/${y.year}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
