'use client'

import { useEffect, useState } from 'react'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Provider {
  id: string
  name: string
  description: string | null
  website: string | null
  contactEmail: string | null
  contactPhone: string | null
  isActive: boolean
  createdAt: string
}

type SortField = 'name' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export function SmartProviderTable() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Поиск и фильтры
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Сортировка
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Редактирование
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Provider>>({})
  const [saving, setSaving] = useState(false)

  // Добавление нового провайдера
  const [isAdding, setIsAdding] = useState(false)
  const [newProviderData, setNewProviderData] = useState({
    name: '',
    description: '',
    website: '',
    contactEmail: '',
    contactPhone: ''
  })

  useEffect(() => {
    fetchProviders()
  }, [])

  useEffect(() => {
    filterAndSortProviders()
  }, [providers, searchQuery, statusFilter, sortField, sortDirection])

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/providers')
      if (!response.ok) throw new Error('Ошибка загрузки провайдеров')

      const data = await response.json()
      setProviders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProviders = () => {
    let filtered = [...providers]

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(query) ||
        provider.description?.toLowerCase().includes(query) ||
        provider.website?.toLowerCase().includes(query) ||
        provider.contactEmail?.toLowerCase().includes(query)
      )
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(provider =>
        statusFilter === 'active' ? provider.isActive : !provider.isActive
      )
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredProviders(filtered)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const startEditing = (provider: Provider) => {
    setEditingId(provider.id)
    setEditFormData({
      name: provider.name,
      description: provider.description,
      website: provider.website,
      contactEmail: provider.contactEmail,
      contactPhone: provider.contactPhone
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditFormData({})
  }

  const saveProvider = async (providerId: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/providers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: providerId,
          ...editFormData
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка сохранения')
      }

      const updatedProvider = await response.json()
      setProviders(providers.map(p => p.id === providerId ? updatedProvider : p))
      setEditingId(null)
      setEditFormData({})
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const toggleProviderStatus = async (providerId: string, currentStatus: boolean) => {
    if (!confirm(`Вы уверены, что хотите ${currentStatus ? 'деактивировать' : 'активировать'} провайдера?`)) {
      return
    }

    try {
      const response = await fetch(`/api/providers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: providerId,
          isActive: !currentStatus
        })
      })

      if (!response.ok) throw new Error('Ошибка изменения статуса')

      const updatedProvider = await response.json()
      setProviders(providers.map(p => p.id === providerId ? updatedProvider : p))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка изменения статуса')
    }
  }

  const deleteProvider = async (providerId: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить провайдера "${name}"? Это действие нельзя отменить.`)) {
      return
    }

    try {
      const response = await fetch(`/api/providers/${providerId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Ошибка удаления провайдера')

      setProviders(providers.filter(p => p.id !== providerId))
      alert('Провайдер успешно удален')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления провайдера')
    }
  }

  const addNewProvider = async () => {
    if (!newProviderData.name.trim()) {
      alert('Название провайдера обязательно')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProviderData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка создания провайдера')
      }

      const createdProvider = await response.json()
      setProviders([...providers, createdProvider])
      setIsAdding(false)
      setNewProviderData({
        name: '',
        description: '',
        website: '',
        contactEmail: '',
        contactPhone: ''
      })
      alert('Провайдер успешно добавлен!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка создания провайдера')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Загрузка...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>
  }

  return (
    <div className="space-y-4">
      {/* Панель фильтров и добавления */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Поиск */}
          <div>
            <Input
              type="text"
              placeholder="🔍 Поиск по названию, сайту, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Фильтр по статусу */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>

          {/* Кнопка добавления */}
          <div>
            <Button
              onClick={() => setIsAdding(!isAdding)}
              variant={isAdding ? 'secondary' : 'primary'}
              className="w-full"
            >
              {isAdding ? '✕ Отмена' : '➕ Добавить провайдера'}
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Найдено: <span className="font-semibold">{filteredProviders.length}</span> из {providers.length} провайдеров
        </div>
      </div>

      {/* Форма добавления нового провайдера */}
      {isAdding && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-lg text-gray-900">Новый провайдер курсов</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              type="text"
              placeholder="Название провайдера *"
              value={newProviderData.name}
              onChange={(e) => setNewProviderData({ ...newProviderData, name: e.target.value })}
              required
            />

            <Input
              type="url"
              placeholder="Веб-сайт (https://...)"
              value={newProviderData.website}
              onChange={(e) => setNewProviderData({ ...newProviderData, website: e.target.value })}
            />

            <Input
              type="email"
              placeholder="Email для связи"
              value={newProviderData.contactEmail}
              onChange={(e) => setNewProviderData({ ...newProviderData, contactEmail: e.target.value })}
            />

            <Input
              type="tel"
              placeholder="Телефон"
              value={newProviderData.contactPhone}
              onChange={(e) => setNewProviderData({ ...newProviderData, contactPhone: e.target.value })}
            />
          </div>

          <textarea
            placeholder="Описание провайдера"
            value={newProviderData.description}
            onChange={(e) => setNewProviderData({ ...newProviderData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
          />

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsAdding(false)}>
              Отмена
            </Button>
            <Button onClick={addNewProvider} disabled={saving}>
              {saving ? 'Сохранение...' : '💾 Сохранить'}
            </Button>
          </div>
        </div>
      )}

      {/* Таблица */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableHead
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('name')}
            >
              Название {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Описание</TableHead>
            <TableHead>Контакты</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('createdAt')}
            >
              Дата {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Действия</TableHead>
          </TableHeader>
          <TableBody>
            {filteredProviders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Провайдеры не найдены
                </TableCell>
              </TableRow>
            ) : (
              filteredProviders.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">
                    {editingId === provider.id ? (
                      <Input
                        type="text"
                        value={editFormData.name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        placeholder="Название"
                        className="text-sm"
                      />
                    ) : (
                      <div>
                        <div className="font-semibold">{provider.name}</div>
                        {provider.website && (
                          <a
                            href={provider.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            🔗 {provider.website}
                          </a>
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="max-w-xs">
                    {editingId === provider.id ? (
                      <textarea
                        value={editFormData.description || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        placeholder="Описание"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        rows={2}
                      />
                    ) : (
                      <div className="text-gray-600 text-sm truncate">
                        {provider.description || '—'}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-sm">
                    {editingId === provider.id ? (
                      <div className="space-y-1">
                        <Input
                          type="email"
                          value={editFormData.contactEmail || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, contactEmail: e.target.value })}
                          placeholder="Email"
                          className="text-xs"
                        />
                        <Input
                          type="tel"
                          value={editFormData.contactPhone || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, contactPhone: e.target.value })}
                          placeholder="Телефон"
                          className="text-xs"
                        />
                      </div>
                    ) : (
                      <div className="text-gray-600">
                        {provider.contactEmail && (
                          <div className="text-xs">📧 {provider.contactEmail}</div>
                        )}
                        {provider.contactPhone && (
                          <div className="text-xs">📞 {provider.contactPhone}</div>
                        )}
                        {!provider.contactEmail && !provider.contactPhone && '—'}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <button
                      onClick={() => toggleProviderStatus(provider.id, provider.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 ${
                        provider.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {provider.isActive ? 'Активен' : 'Неактивен'}
                    </button>
                  </TableCell>

                  <TableCell className="text-gray-500 text-sm">
                    {new Date(provider.createdAt).toLocaleDateString('ru-RU')}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {editingId === provider.id ? (
                        <>
                          <button
                            onClick={() => saveProvider(provider.id)}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            {saving ? '...' : '✓ Сохранить'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                          >
                            ✕ Отмена
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(provider)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            ✏️ Изменить
                          </button>
                          <button
                            onClick={() => deleteProvider(provider.id, provider.name)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            🗑️ Удалить
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
