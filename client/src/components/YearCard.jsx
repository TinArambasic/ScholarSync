import React from 'react'
import { Link } from 'react-router-dom'

export default function YearCard({ year, name, description, courses }){
  const gradients = {
    1: 'from-blue-500 to-blue-600',
    2: 'from-primary-600 to-primary-800',
    3: 'from-purple-500 to-purple-600'
  }

  const grad = gradients[year] || gradients[2]

  return (
    <div className={`bg-gradient-to-br ${grad} rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-2xl mb-2">{name}</h3>
          <p className="text-sm text-white/80">{description}</p>
        </div>
      </div>
      <div className="border-t border-white/30 mt-4 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-white/90">{courses} kolegija</span>
          <Link to={`/years/${year}`} className="text-white hover:text-white/90 font-bold text-sm">Pregledaj →</Link>
        </div>
      </div>
    </div>
  )
}
