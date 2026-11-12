import { createContext, useContext } from 'react'
import { useCategoriesStore } from '../hooks/useCategories'

const CategoriesCtx = createContext(null)

export function CategoriesProvider({ children }) {
  const value = useCategoriesStore()
  return <CategoriesCtx.Provider value={value}>{children}</CategoriesCtx.Provider>
}

export function useCategories() {
  const ctx = useContext(CategoriesCtx)
  if (!ctx) throw new Error('useCategories harus dipakai di dalam CategoriesProvider')
  return ctx
}

export default CategoriesCtx
