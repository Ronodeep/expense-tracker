/**
 * Custom hook to load group data and current member.
 * Replaces the duplicated useEffect pattern across 5 pages.
 */
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { loadGroup, loadCurrentMember } from '../lib/storage'

export function useGroup() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [currentMember, setCurrentMember] = useState(null)

  const refresh = useCallback(() => {
    const g = loadGroup(groupId)
    if (!g) {
      navigate('/')
      return
    }
    setGroup(g)
    setCurrentMember(loadCurrentMember(groupId))
  }, [groupId, navigate])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { group, groupId, currentMember, refresh }
}
